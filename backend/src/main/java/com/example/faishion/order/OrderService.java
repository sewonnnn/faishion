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


    public Order findOrderWithItems(String clientOrderId) {
        return null;
    }

    public void createOrderFromCartItems(List<Long> cartIds) {
    }
}
