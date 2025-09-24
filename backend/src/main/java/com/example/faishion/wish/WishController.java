package com.example.faishion.wish;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductService;
import com.example.faishion.product.ProductWishDTO;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import com.example.faishion.user.UserUpdateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
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
    public ResponseEntity<String> wishSave(@PathVariable Long productId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
        Optional<Wish> wish = wishService.findByProductId(productId,user);
        String msg = "";
        if (wish.isPresent()) {
            msg = "이미 찜한 상품입니다.";
            return ResponseEntity.ok(msg);
        } else {
            Product product = productService.findById(productId);
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

    // 찜한상품 보여주기
    @GetMapping("list")
    public ResponseEntity<List<ProductWishDTO>> getAllWishes(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));
        List<Wish> wishs = wishService.findByUser(user); // 해당 유저의 위시리스트 가져오기
        List<ProductWishDTO> products = new ArrayList<>();
        for (Wish wish : wishs) {
            products.add(new ProductWishDTO(
                    wish.getProduct().getId(),
                    wish.getProduct().getName(),
                    wish.getProduct().getPrice(),
                    wish.getProduct().getDiscountPrice(),
                    wish.getProduct().getMainImageList().iterator().next().getId()
            ));
        }
        return ResponseEntity.ok(products);
    }
}
