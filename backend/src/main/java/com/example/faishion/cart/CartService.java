package com.example.faishion.cart;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;


    void save(Cart cart) {
        cartRepository.save(cart);
    }
}
