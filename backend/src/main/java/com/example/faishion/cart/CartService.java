package com.example.faishion.cart;

import com.example.faishion.product.Product;
import com.example.faishion.stock.Stock;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;

    // 장바구니 리스트 출력
    public List<CartProductDTO> findAllCartList() {
        List<Cart> cartList = cartRepository.findAll();

        return cartList.stream()
                .map(CartProductDTO::new)
                .collect(Collectors.toList());
    }

    public void save(Cart cart) {
        cartRepository.save(cart);
    }

}

