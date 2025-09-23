package com.example.faishion.review;

import com.example.faishion.image.Image;
import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/review")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // 리뷰저장
    @PostMapping("/save")
    public ResponseEntity<String> saveReview(
            @RequestPart("reviewData") ReviewDTO reviewDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles
    ) {

        try {
            // Optional 객체를 반환받아 isPresent()로 존재 여부를 먼저 확인
            System.out.println(reviewDto.getUserId());
            Optional<User> userOptional = userRepository.findById(reviewDto.getUserId());

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                // 찾은 사용자의 ID와 Name을 출력하여 확인
                System.out.println("[Controller] 찾은 사용자 ID: " + user.getId());
                System.out.println("[Controller] 찾은 사용자 Name: " + user.getName());

                Product product = productRepository.findById(reviewDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

                Review review = new Review();
                review.setContent(reviewDto.getContent());
                review.setRating(reviewDto.getRating());
                review.setUser(user);
                review.setProduct(product);

                reviewService.saveReviewWithImages(review, imageFiles);
                return ResponseEntity.status(HttpStatus.CREATED).body("리뷰가 성공적으로 등록되었습니다.");

            } else {
                throw new RuntimeException("사용자를 찾을 수 없습니다.");
            }

        } catch (Exception e) {
            e.printStackTrace(); // 전체 스택 트레이스 출력
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("리뷰 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 화면에 보여주기용
    @GetMapping("/{productId}")
    public Page<ReviewResponseDTO> getReviewsByProductId(
            @PathVariable Long productId,
            HttpServletRequest request,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<Review> reviewsPage = reviewService.findByProduct_Id(productId, pageable);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String domain = request.getScheme() + "://" + request.getServerName() +
                (request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort());

        return reviewsPage.map(review -> {
            // NullPointerException 방지: review.getUser()가 null일 수 있음을 고려
            String userName = (review.getUser() != null) ? review.getUser().getName() : "익명 사용자";

            return new ReviewResponseDTO(
                    review.getId(),
                    userName, // 올바르게 수정됨
                    review.getContent(),
                    review.getRating(),
                    review.getCreatedAt().format(formatter),
                    review.getImageList().stream()
                            .map(image -> domain + "/image/" + image.getId())
                            .collect(Collectors.toList())
            );
        });
    }

    // 신고 메서드
    @GetMapping("/isReported/{reviewId}")
    public boolean isReported(@PathVariable Long reviewid) {
        System.out.println("reviewid : " +reviewid);
        if(reviewid == null){
            return false;
        }
        if(reviewService.reportReview(reviewid)){
            System.out.println("신고에 성공했습니다.");
        }else{
            System.out.println("신고 실패");
        }
        return true;
    }
}