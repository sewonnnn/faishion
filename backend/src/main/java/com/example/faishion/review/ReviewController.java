package com.example.faishion.review;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/review")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // 리뷰 저장: POST 요청을 받도록 변경하고 @RequestBody로 JSON을 받음
    @PostMapping("/save")
    public ResponseEntity<String> saveReview(@RequestBody ReviewDTO reviewDto) {
        Review review = new Review();
        review.setContent(reviewDto.getContent());
        review.setRating(reviewDto.getRating());
        User user = userRepository.getReferenceById("sewon");
        Product product = productRepository.getReferenceById(reviewDto.getProductId());
        review.setUser(user);
        review.setProduct(product);
        reviewService.save(review);
        return ResponseEntity.status(HttpStatus.CREATED).body("리뷰가 성공적으로 등록되었습니다.");
    }

    // 특정 상품의 리뷰 목록 조회: GET 요청으로 productId를 받아 DTO 목록을 반환
    @GetMapping("/{productId}")
    public List<ReviewResponseDTO> getReviewsByProductId(@PathVariable Long productId) {
        List<Review> reviews = reviewService.findByProduct_Id(productId);
        if (reviews == null || reviews.isEmpty()) {
            // 리뷰가 없을 경우 빈 리스트 반환
            return List.of();
        }

        // Review 엔티티 목록을 ReviewResponseDTO 목록으로 변환
        return reviews.stream()
                .map(review -> new ReviewResponseDTO(
                        review.getId(),
                        review.getUser().getName(),
                        review.getContent(),
                        review.getRating(),
                        review.getCreatedAt().toString() // LocalDateTime을 String으로 변환
                ))
                .collect(Collectors.toList());
    }
}
