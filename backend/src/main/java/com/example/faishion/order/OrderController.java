package com.example.faishion.order;

import com.example.faishion.cart.Cart;
import com.example.faishion.cart.CartProductDTO;
import com.example.faishion.cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;
    private final CartService cartService;


    // 선택된 상품들을 받아 주문을 생성
    @PostMapping("/new")
    public String createOrder(@RequestBody List<Long> cartIds) {
        // 이 메서드는 프론트엔드에서 POST 요청으로 직접 배열을 보낼 때 사용
        orderService.createOrderFromCartItems(cartIds);
        return "Order created successfully!";
    }

    @GetMapping("/new")
    public List<CartProductDTO> getOrderData(@RequestParam("ids") String idsString) {
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

        for(CartProductDTO cart : orderItems) {
            System.out.println(cart.getId());
            System.out.println(cart.getQuantity());
            System.out.println(cart.getProductPrice());
        }
        return orderItems;
    }
}
