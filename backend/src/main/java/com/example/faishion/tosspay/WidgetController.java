package com.example.faishion.tosspay;

import com.example.faishion.order.Order;
import com.example.faishion.order.OrderItem;
import com.example.faishion.order.OrderService;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@RestController
public class WidgetController {

    private final Logger log = LoggerFactory.getLogger(getClass());
    private final OrderService orderService;

    public WidgetController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(
            @RequestBody String jsonBody
    ) {
        JSONParser parser = new JSONParser(JSONParser.MODE_PERMISSIVE);

        try {
            // --- 1) 요청 파싱 (안전 캐스팅) ---
            JSONObject req = (JSONObject) parser.parse(jsonBody);
            String orderId = asString(req.get("orderId"));
            String paymentKey = asString(req.get("paymentKey"));
            long amount = asLong(req.get("amount"));

            if (orderId == null || paymentKey == null) {
                return ResponseEntity.badRequest().body(error("INVALID_REQUEST", "orderId/paymentKey 누락"));
            }

            // --- 2) Toss 승인 호출 ---
            JSONObject tossReq = new JSONObject();
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
            JSONObject tossRes = (JSONObject) parser.parse(new InputStreamReader(is, StandardCharsets.UTF_8));
            if (is != null) is.close();

            if (code != 200) {
                // Toss 쪽 에러를 그대로 프론트로 전달
                log.warn("Toss confirm failed: {}", tossRes);
                return ResponseEntity.status(code).body(tossRes);
            }

            // --- 3) 주문 조회 + DTO 구성 ---
            // orderId == clientOrderId 로 조회
            Order order = orderService.findOrderWithItems(orderId);
            if (order == null) {
                return ResponseEntity.status(404).body(error("ORDER_NOT_FOUND", "주문을 찾을 수 없습니다: " + orderId));
            }


            JSONObject result = new JSONObject();
            result.put("orderId", order.getId());               // 내부 PK
            result.put("clientOrderId", order.getClientOrderId());
            result.put("orderName", order.getOrderName());
            result.put("totalAmount", order.getTotalAmount());

            List<JSONObject> items = new ArrayList<>();
            for (OrderItem item : order.getOrderItemList()) {
                JSONObject ji = new JSONObject();
                // ⭐️ 엔티티 구조: OrderItem -> Stock -> Product
                String productName = null;
                if (item.getStock() != null && item.getStock().getProduct() != null) {
                    productName = item.getStock().getProduct().getName();
                }
                ji.put("productName", productName);
                ji.put("quantity", item.getQuantity());
                ji.put("price", item.getPrice());
                items.add(ji);
            }
            result.put("items", items);

            // (선택) 주문 상태 업데이트
            // orderService.markCompleted(order.getId());

            return ResponseEntity.ok(result);

        } catch (ParseException e) {
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
    private static JSONObject error(String code, String message) {
        JSONObject o = new JSONObject();
        o.put("code", code);
        o.put("message", message);
        return o;
    }
}
