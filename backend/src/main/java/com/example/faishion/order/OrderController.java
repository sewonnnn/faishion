package com.example.faishion.order;

import com.example.faishion.address.Address;
import com.example.faishion.address.AddressRepository;
import com.example.faishion.cart.Cart;
import com.example.faishion.cart.CartProductDTO;
import com.example.faishion.cart.CartService;
import com.example.faishion.stock.Stock;
import com.example.faishion.stock.StockRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.minidev.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
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
        // 1. 사용자 및 배송지 엔티티 조회
        if(userDetails == null) throw new RuntimeException("인증된 사용자 정보가 없습니다.");

        User user = userRepository.findById(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Address address = addressRepository.findByUser(user);

        System.out.println("주문자 주소:"+address.getDetail());

        // 2. 주문 생성
        String clientOrderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis();

        System.out.println("주문자 id 생성:"+clientOrderId);

        Order order = new Order();
        order.setClientOrderId(clientOrderId);
        order.setUser(user);
        order.setAddress(address);
        order.setStatus("PENDING");
        order.setOrderName(request.getOrderName());
        order.setTotalAmount(request.getTotalAmount());
        orderRepository.save(order);

        System.out.println("주문 저장 완료:"+order.getStatus());

        // 3. 주문 상품 생성 및 재고 차감
        for (OrderCreateRequestDTO.OrderItemDTO itemDTO : request.getItems()) {
            Stock stock = stockRepository.findById(itemDTO.getStockId())
                    .orElseThrow(() -> new IllegalArgumentException("재고를 찾을 수 없습니다: " + itemDTO.getStockId()));

            // ⭐ 재고 확인 및 차감 로직
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
}
