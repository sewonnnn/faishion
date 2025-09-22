package com.example.faishion.cart;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.product.ProductService;
import com.example.faishion.stock.Stock;
import com.example.faishion.stock.StockDTO;
import com.example.faishion.stock.StockRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/cart")
@RestController
public class CartController {
    private final CartService cartService;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final ProductService productService;

    // 장바구니 리스트
    @GetMapping("/list")
    public List<CartProductDTO> getCartProducts() {
        return cartService.findAllCartList();
    }

    @PostMapping("/save")
    public boolean cartSave(@RequestBody StockDTO stockDTO) {

        // 임시 사용자 생성
        User user = userRepository.getReferenceById("sewon"); // 임시 아이디
        Stock stock = stockRepository.findById(1).get();

        Product product = productService.findById(stockDTO.getProductId());
        stock.setProduct(product);

        // 장바구니 객체 생성 및 저장
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setStock(stock);
        cart.setQuantity(stockDTO.getQuantity());
        cartService.save(cart);

        return true;
    }
}
