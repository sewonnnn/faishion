package com.example.faishion.review;

import com.example.faishion.product.Product;
import com.example.faishion.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController // @Controller 대신 @RestController를 사용하여 JSON을 반환
@RequiredArgsConstructor
@RequestMapping("/review")
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 저장: POST 요청을 받도록 변경하고 @RequestBody로 JSON을 받음
    @PostMapping("/save")
    public ResponseEntity<String> saveReview(@RequestBody ReviewDTO reviewDto) {
        // 실제 로직: DTO를 엔티티로 변환 후 DB 저장
        Review review = new Review();
        review.setContent(reviewDto.getContent());
        // 실제로는 사용자 및 상품 정보를 DB에서 가져와서 설정해야 함
        review.setProduct(new Product(reviewDto.getProductId())); // DTO에서 받은 상품 ID 사용
        review.setUser(new User()); // 임시 사용자 ID 설정

        Review review1 = reviewService.save(review);
        return ResponseEntity.status(HttpStatus.CREATED).body("리뷰가 성공적으로 등록되었습니다.");
    }

    // 특정 상품의 리뷰 목록 조회: GET 요청으로 productId를 받아 처리
    @GetMapping("/{productId}")
    public List<Review> getReviewsByProductId(@PathVariable Long productId) {
        // DB에서 해당 상품 ID의 리뷰를 조회하는 실제 로직
        // 현재는 Mock 데이터로 대체
        List<Review> mockReviews = new ArrayList<>();
        // 예시 리뷰 데이터
        Review review1 = new Review();
        review1.setId(1L);
        review1.setContent("이 상품 정말 최고예요!");
        review1.setProduct(new Product(productId));
        review1.setUser(new User()); // 사용자 정보 mock

        mockReviews.add(review1);

        return mockReviews;
    }
}