package com.example.faishion.cart;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.product.ProductService;
import com.example.faishion.stock.Stock;
import com.example.faishion.stock.StockDTO;
import com.example.faishion.stock.StockRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/cart")
@RestController
public class CartController {
    private final CartService cartService;
    private final ProductService productService;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;

    @PostMapping("/save")
    public boolean cartSave(@RequestBody StockDTO stockDTO) {
        System.out.println("DTO 수량: " + stockDTO.getQuantity());
        System.out.println("DTO 색상: " + stockDTO.getColor());
        System.out.println("DTO 사이즈: " + stockDTO.getSize());
        System.out.println("DTO 상품 ID: " + stockDTO.getProductId());

        /*
        // DTO에서 받은 상품 ID로 Product 객체 조회
        Product product = productService.findById(stockDTO.getProductId());
        System.out.println(product.getName());
        // DTO의 정보로 Stock 엔티티 객체 생성
        Stock stock = new Stock();
        stock.setQuantity(stockDTO.getQuantity());
        stock.setColor(stockDTO.getColor());
        stock.setSize(stockDTO.getSize());
        stock.setProduct(product); // 조회한 Product 객체 설정

         */

        // 임시 사용자 생성
        User user = userRepository.getReferenceById("sewon"); //임시 아이디
        Stock stock = stockRepository.getReferenceById(1);
        // 장바구니 객체 생성 및 저장
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setStock(stock);
        cart.setQuantity(stockDTO.getQuantity());
        cartService.save(cart);

        System.out.println("저장 완료: " + cart);

        return true;
    }
}
