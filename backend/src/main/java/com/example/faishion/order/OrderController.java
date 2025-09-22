package com.example.faishion.order;

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
    public String getNewOrderPage(@RequestParam("ids") String idsString) {
        //쉼표로 구분된 문자열을 배열로 분리
        List<String> idsList = Arrays.asList(idsString.split(","));

        // 문자열 ID를 Long 타입으로 변환
        List<Long> cartIds = idsList.stream()
                .map(Long::parseLong)
                .collect(Collectors.toList());

        // 변환된 cartIds 리스트를 사용하여 주문
        // 주문 서비스에 cartIds를 전달
         orderService.createOrderFromCartItems(cartIds);

        return "주문 페이지에 필요한 데이터를 전달했습니다.";
    }
}
