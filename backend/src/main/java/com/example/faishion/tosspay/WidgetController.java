package com.example.faishion.tosspay;

import com.example.faishion.cart.CartService;
import com.example.faishion.order.Order;
import com.example.faishion.order.OrderItem;
import com.example.faishion.order.OrderService;
import com.example.faishion.payment.Payment;
import com.example.faishion.user.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class WidgetController {

    private final Logger log = LoggerFactory.getLogger(getClass());
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OrderService orderService;
    private final CartService cartService; // ⭐ CartService 필드 추가

    public WidgetController(OrderService orderService, CartService cartService) {
        this.orderService = orderService;
        this.cartService = cartService;

    }

    @PostMapping("/api/confirm")
    public ResponseEntity<?> confirmPayment(
            @RequestBody String jsonBody
    ) {
        try {
            // --- 1) 요청 파싱 (안전 캐스팅) ---
            Map<String, Object> req = objectMapper.readValue(jsonBody, Map.class);
            String orderId = asString(req.get("orderId"));
            String paymentKey = asString(req.get("paymentKey"));
            long amount = asLong(req.get("amount"));

            if (orderId == null || paymentKey == null) {
                return ResponseEntity.badRequest().body(error("INVALID_REQUEST", "orderId/paymentKey 누락"));
            }

            // --- 2) Toss 승인 호출 ---
            Map<String, Object> tossReq = new HashMap<>(); // ⭐ HashMap 사용
            tossReq.put("orderId", orderId);
            tossReq.put("amount", amount);
            tossReq.put("paymentKey", paymentKey);

            String widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
            String auth = "Basic " + Base64.getEncoder()
                    .encodeToString((widgetSecretKey + ":").getBytes(StandardCharsets.UTF_8));

            URL url = new URL("https://api.tosspayments.com/v1/payments/confirm");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestProperty("Authorization", auth);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(tossReq.toString().getBytes(StandardCharsets.UTF_8));
            }

            int code = conn.getResponseCode();
            InputStream is = (code == 200) ? conn.getInputStream() : conn.getErrorStream();
            Map<String, Object> tossRes = objectMapper.readValue(is, Map.class); // Map.class로 파싱
            if (is != null) is.close();

            if (code != 200) {
                // Toss 쪽 에러를 그대로 프론트로 전달
                log.warn("Toss confirm failed: {}", tossRes);
                return ResponseEntity.status(code).body(tossRes);
            }

            // tossRes에서 결제수단(method) 안전하게 추출
            String paymentType = safeExtractPaymentMethod(tossRes);


            // amount는 Payment.amount(Integer)에 맞춰 int로 변환(범위 체크)
            int paidAmount = toIntExact(amount);

            // Service에서 처리
            Payment saved = orderService.recordSuccessPaymentAndCompleteOrder(
                    orderId,        //clientOrderId
                    paymentKey,
                    paymentType,
                    paidAmount
            );


            // --- 3) 주문 조회 + DTO 구성 ---
            Order order = orderService.findOrderWithItems(orderId);
            if (order == null) {
                return ResponseEntity.status(404).body(error("ORDER_NOT_FOUND", "주문을 찾을 수 없습니다: " + orderId));
            }

            Map<String, Object> result = new HashMap();
            result.put("orderId", order.getId());               // 내부 PK
            result.put("clientOrderId", order.getClientOrderId());
            result.put("orderName", order.getOrderName());
            result.put("totalAmount", order.getTotalAmount());
            result.put("status", order.getStatus());
            result.put("paymentId", saved.getId());
            result.put("paymentKey", paymentKey);
            result.put("paymentType", paymentType);
            result.put("paidAmount", saved.getAmount());

            // 장바구니 ID 추출 및 삭제
            List<Long> cartIdsToDelete = order.getOrderItemList().stream()
                    .map(OrderItem::getCartId)
                    .filter(Objects::nonNull) // cartId가 null이 아닌 경우(장바구니 구매)만 선택
                    .collect(Collectors.toList());

            if (!cartIdsToDelete.isEmpty()) {
                cartService.deleteCartsByIds(cartIdsToDelete); // CartService를 사용하여 삭제
                log.info("결제 성공으로 장바구니 항목 삭제 완료: {}", cartIdsToDelete);
            }

            /* 배송/주문자 정보 */
            User user = order.getUser();

            String receiverName = (user != null) ? nullToEmpty(user.getName()) : "";
            String phone        = (user != null) ? nullToEmpty(user.getPhoneNumber()) : "";
            String zipcode      = (order != null) ? nullToEmpty(order.getZipcode()) : "";
            String street       = (order != null) ? nullToEmpty(order.getStreet()) : "";
            String detail       = (order != null) ? nullToEmpty(order.getDetail()) : "";
            String requestMsg   = (order != null) ? nullToEmpty(order.getRequestMsg()) : "";

            String fullAddress  = joinNonBlank(street, detail, zipcode);

            result.put("receiverName", receiverName);
            result.put("address", fullAddress);
            result.put("phone", phone);
            if (!requestMsg.isBlank()) {
                result.put("requestMsg", requestMsg);
            }

            /* 상품 목록 */
            List<Map<String, Object>> items = new ArrayList<>();
            for (OrderItem item : order.getOrderItemList()) {
                Map<String, Object> ji = new HashMap<>();

                String productName = null;
                String brand = null;
                Integer originalPrice = null;
                Long productImageId = null;

                if (item.getStock() != null && item.getStock().getProduct() != null) {
                    var product = item.getStock().getProduct();

                    productName   = nullToEmpty(product.getName());
                    brand         = (product.getSeller() != null) ? nullToEmpty(product.getSeller().getBusinessName()) : "";
                    originalPrice = product.getPrice();

                    // Product.mainImageList에서 대표 이미지 1장 뽑기
                    productImageId = firstImageId(product.getMainImageList());
                }

                ji.put("productName", productName);
                ji.put("brand", brand);
                if (productImageId != null) ji.put("productImageId", productImageId);
                if (originalPrice != null)  ji.put("originalPrice", originalPrice);

                ji.put("quantity", item.getQuantity());
                ji.put("price", item.getPrice()); // 주문 시점 확정 단가
                items.add(ji);
            }
            result.put("items", items);


            return ResponseEntity.ok(result);

        } catch (JsonProcessingException e) {
            log.error("JSON 파싱 실패", e);
            return ResponseEntity.badRequest().body(error("INVALID_JSON", "요청 본문 파싱 실패"));
        } catch (Exception e) {
            log.error("confirmPayment 서버 오류", e);
            return ResponseEntity.internalServerError().body(error("SERVER_ERROR", e.getMessage()));
        }
    }

    private static String asString(Object v) {
        return (v == null) ? null : String.valueOf(v);
    }
    private static long asLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(String.valueOf(v));
    }
    private static Map<String, Object> error(String code, String message) {
        Map<String, Object> o = new HashMap();
        o.put("code", code);
        o.put("message", message);
        return o;
    }

    // long → int 변환 (범위 체크 포함)
    private static int toIntExact(long v) {
        if (v > Integer.MAX_VALUE || v < Integer.MIN_VALUE) {
            throw new IllegalArgumentException("amount 범위를 벗어났습니다: " + v);
        }
        return (int) v;
    }

    // Toss 응답에서 결제수단(method) 안전하게 추출
    private static String safeExtractPaymentMethod(Map<String, Object> tossRes) {
        String method = asString(tossRes.get("method"));
        if (method != null && !method.isBlank()) return method;

        // 일부 응답에서는 하위 객체로만 제공될 수 있음
        if (tossRes.get("card") != null) return "CARD";
        if (tossRes.get("virtualAccount") != null) return "VIRTUAL_ACCOUNT";
        if (tossRes.get("transfer") != null) return "TRANSFER";
        if (tossRes.get("mobilePhone") != null) return "MOBILE_PHONE";
        if (tossRes.get("giftCertificate") != null) return "GIFT_CERTIFICATE";
        if (tossRes.get("cashReceipt") != null) return "CASH_RECEIPT";
        return "UNKNOWN";
    }

    private static String nullToEmpty(String s) {
        return (s == null) ? "" : s;
    }

    private static String joinNonBlank(String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p != null && !p.isBlank()) {
                if (sb.length() > 0) sb.append(' ');
                sb.append(p.trim());
            }
        }
        return sb.toString();
    }

    private static Long firstImageId(java.util.Set<com.example.faishion.image.Image> images) {
        if (images == null || images.isEmpty()) return null;
        for (var img : images) {
            if (img != null && img.getId() != null) return img.getId();
        }
        return null;
    }
}
