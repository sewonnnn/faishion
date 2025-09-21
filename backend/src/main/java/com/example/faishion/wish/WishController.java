package com.example.faishion.wish;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductService;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wish")
public class WishController {
    private final ProductService productService;
    private final WishService wishService;
    private final UserRepository userRepository;

    // 찜한상품 저장 메서드
    @PostMapping("/save/{productId}")
    public ResponseEntity<String> wishSave(@PathVariable Long productId) {
        Optional<Wish> wish = wishService.findByProductId(productId); // 추후에 유저 생기면 유저의 상품으로 복합검색 해야함
        String msg = "";
        if (wish.isPresent()) {
            msg = "이미 찜한 상품입니다.";
            return ResponseEntity.ok(msg);
        } else {
            Product product = productService.findById(productId);
            User user = userRepository.getReferenceById("sewon"); //임시 아이디
            Wish newWish = new Wish();
            newWish.setProduct(product);
            newWish.setUser(user);

            Wish check = wishService.save(newWish);
            if (check != null) {
                msg = "상품 등록이 완료되었습니다.";
                return ResponseEntity.ok(msg);
            }else{
                msg = "상품 등록 간 오류가 발생하였습니다.";
                return ResponseEntity.ok(msg);
            }
        }
    }
}
