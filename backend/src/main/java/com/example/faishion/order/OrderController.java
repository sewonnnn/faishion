package com.example.faishion.order;

import com.example.faishion.address.AddressRepository;
import com.example.faishion.cart.Cart;
import com.example.faishion.cart.CartProductDTO;
import com.example.faishion.cart.CartService;
import com.example.faishion.delivery.Delivery;
import com.example.faishion.stock.Stock;
import com.example.faishion.stock.StockRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.minidev.json.JSONObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;

    // 선택된 상품들을 받아 주문서 생성
    @PostMapping("/new")
    public String createOrder(@RequestBody List<Long> cartIds) {
        // 이 메서드는 프론트엔드에서 POST 요청으로 직접 배열을 보낼 때 사용
        orderService.createOrderFromCartItems(cartIds);
        return "Order created successfully!";
    }

    // 주문서 생성
    @GetMapping("/new")
    public List<CartProductDTO> getOrderData(@RequestParam("ids") String idsString, @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println("받은 카트 ID들: " + idsString);

        // 1. URL 파라미터에서 받은 장바구니의 목록 추출
        List<Long> cartIds = Arrays.stream(idsString.split(","))
                .map(Long::parseLong)
                .collect(Collectors.toList());

        // 2. 모든 상품 관련 정보를 한 번에 조회
        List<Cart> carts = cartService.findCartsWithDetailsByIds(cartIds);

        // 3. 조회된 Carts 리스트를 DTO 리스트로 변환하여 반환
        List<CartProductDTO> orderItems = carts.stream()
                .map(CartProductDTO::new)
                .collect(Collectors.toList());
        return orderItems;
    }


    // order DB 저장
    @Transactional
    @PostMapping("/create")
    public ResponseEntity<JSONObject> createPendingOrder(
            @RequestBody OrderCreateRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println("로그인한 사용자:"+userDetails.getUsername());
        System.out.println("-----------주문 생성 시작----------------------");
        // 1. 사용자 엔티티 조회
        if(userDetails == null) throw new RuntimeException("인증된 사용자 정보가 없습니다.");
        User user = userRepository.findById(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. 주문 생성
        String clientOrderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis();
        Order order = new Order();
        order.setClientOrderId(clientOrderId);
        order.setUser(user);

        order.setZipcode(request.getZipcode());
        order.setStreet(request.getStreet());
        order.setDetail(request.getDetail());
        order.setRequestMsg(request.getRequestMsg());

        order.setStatus("PENDING");
        order.setOrderName(request.getOrderName());
        order.setTotalAmount(request.getTotalAmount());
        orderRepository.save(order);
        System.out.println("주문 저장 완료:"+order.getStatus());

        // 3. 주문 상품 생성 및 재고 차감
        for (OrderCreateRequestDTO.OrderItemDTO itemDTO : request.getItems()) {
            Stock stock = stockRepository.findById(itemDTO.getStockId())
                    .orElseThrow(() -> new IllegalArgumentException("재고를 찾을 수 없습니다: " + itemDTO.getStockId()));

            // 재고 확인 및 차감 로직
            if (stock.getQuantity() < itemDTO.getQuantity()) {
                throw new IllegalArgumentException("상품 " + stock.getProduct().getName() + "의 재고가 부족합니다.");
            }
            stock.setQuantity(stock.getQuantity() - itemDTO.getQuantity());
            stockRepository.save(stock); // 재고 업데이트

            // 4. OrderItem 엔티티 생성
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setStock(stock);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(itemDTO.getPrice());
            orderItemRepository.save(orderItem);
        }

        // 5. 응답 반환
        JSONObject response = new JSONObject();
        response.put("clientOrderId", clientOrderId);  // 키 통일
        return ResponseEntity.ok(response);
    }


    @GetMapping("/seller")
    public ResponseEntity<Page<SellerOrderDTO>> sellerOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Page<SellerOrderDTO> sellerOrders = orderService.getOrdersBySellerId(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(sellerOrders);
    }

    // 바로 구매 요청 처리용 새로운 엔드포인트 추가
    @PostMapping("/newdirect")
    public List<CartProductDTO> getDirectOrderData(@RequestBody DirectOrderRequestDTO request) {

        List<CartProductDTO> orderItems = new ArrayList<>();

        for (OrderItemRequestDTO itemDTO : request.getItems()) {
            // 프론트에서 받은 상품 ID, 색상, 사이즈로 Stock 엔티티를 조회합니다.
            Optional<Stock> stockOpt = stockRepository.findByProductIdAndColorAndSize(request.getProductId(), itemDTO.getColor(), itemDTO.getSize());

            if (stockOpt.isPresent()) {
                Stock stock = stockOpt.get();
                // CartProductDTO를 만들어 주문 상품 정보를 구성합니다.
                CartProductDTO dto = new CartProductDTO();
                dto.setStockId(stock.getId());
                dto.setProductId(stock.getProduct().getId());
                dto.setProductImageId(stock.getImage().getId());
                dto.setProductName(stock.getProduct().getName());
                dto.setProductPrice(stock.getProduct().getPrice());
                 dto.setDiscountedProductPrice(stock.getProduct().getPrice());
                dto.setProductColor(stock.getColor());
                dto.setProductSize(stock.getSize());
                dto.setQuantity(itemDTO.getQuantity());
                dto.setSellerBusinessName(stock.getProduct().getSeller().getBusinessName());

                orderItems.add(dto);
            } else {
                // 유효하지 않은 옵션에 대한 처리
                throw new IllegalArgumentException("상품 옵션을 찾을 수 없습니다: " + itemDTO.getColor() + ", " + itemDTO.getSize());
            }
        }

        return orderItems;
    }

    // OrderController.java (수정 없음, 이미 로그인 사용자 기준으로 구현됨)
    @GetMapping("/my-history")
    public ResponseEntity<List<OrderListResponseDTO>> getMyOrderHistory(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); // 인증되지 않음 처리
        }

        //  userDetails.getUsername()을 사용하여 현재 로그인한 사용자의 ID(username)를 전달
        List<OrderListResponseDTO> orderHistory = orderService.getMyOrderHistory(userDetails.getUsername());
        return ResponseEntity.ok(orderHistory);
    }

    // 주문 상세 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailDTO> getOrderDetails(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); // 인증되지 않음 처리
        }
        try {
            Order order = orderService.getOrderDetails(orderId, userDetails.getUsername());
            return ResponseEntity.ok(new OrderDetailDTO(order));

        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("주문 상세 조회 중 오류 발생: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
