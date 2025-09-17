package com.example.faishion.cart;

import com.example.faishion.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@RequiredArgsConstructor
@RequestMapping("/cart")
@Controller
public class CartController {
    private final CartService cartService;
}
