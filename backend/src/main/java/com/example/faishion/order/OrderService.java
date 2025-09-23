package com.example.faishion.order;

import com.example.faishion.cart.Cart;
import com.example.faishion.cart.CartRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
        CartRepository cartRepository;
        UserRepository userRepository;
        OrderRepository orderRepository;
        OrderItemRepository orderItemRepository;

    // 장바구니 항목들로 주문을 생성
    public void createOrderFromCartItems(List<Long> cartIds) {
        //cartIds에 해당하는 모든 장바구니 항목을 조회
        List<Cart> cartItems = cartRepository.findAllById(cartIds);

        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("주문할 상품이 장바구니에 존재하지 않습니다.");
        }

        // 새로운 주문 생성
        User user = userRepository.getReferenceById("sewon");
        Order newOrder = new Order();
        newOrder.setUser(user);

        // 주문을 저장
        Order savedOrder = orderRepository.save(newOrder);

        // 각 장바구니 항목을 주문 상품(OrderItem) 엔티티로 변환
        List<OrderItem> orderItems = cartItems.stream()
                .map(cartItem -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(savedOrder); // 생성된 주문 엔티티와 연결
                    orderItem.setStock(cartItem.getStock()); // 주문 상품 정보 연결
                    orderItem.setQuantity(cartItem.getQuantity()); // 수량 연결

                    // 주문 당시의 가격(할인 포함)
                    orderItem.setPrice(cartItem.getStock().getProduct().getDiscountPrice());
                    return orderItem;
                })
                .collect(Collectors.toList());

        // 주문 상품들 한번에 저장
        orderItemRepository.saveAll(orderItems);

        // 주문이 완료된 장바구니 항목 삭제
        cartRepository.deleteAllById(cartIds);
    }
}
