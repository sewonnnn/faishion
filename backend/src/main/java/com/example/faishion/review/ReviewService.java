package com.example.faishion.review;

import com.example.faishion.image.Image;
import com.example.faishion.image.ImageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ImageService imageService;

    // 리뷰 평균 찾기
    public Optional<Double> findRatingAverage(Long productId) {
        return reviewRepository.findAverageRatingByProductId(productId);
    }

    // 리뷰 갯수 찾기
    public Optional<Integer> findCountByProductId(Long productId) {
        return reviewRepository.findCountByProductId(productId);
    }
    // 리뷰 아이디로 리뷰 찾기
    public Review findById(Long id) {
        return reviewRepository.findById(id).orElse(null);
    }
    // 리뷰 저장
    @Transactional
    public Review saveReviewWithImages(Review review, List<MultipartFile> imageFiles) throws IOException {
        // 1. Review 엔티티 먼저 저장
        Review savedReview = reviewRepository.save(review);

        // 2. 이미지 파일이 존재할 경우에만 처리
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                // 파일이 비어있지 않은지 확인
                if (!file.isEmpty()) {
                    Image image = imageService.saveImage(file);
                    savedReview.getImageList().add(image);
                }
            }
        }
        return savedReview;
    }


    // 리뷰목록 불러오기
    public Page<Review> findByProduct_Id(Long productId, Pageable pageable) {
        return reviewRepository.findByProduct_Id(productId, pageable);
    }

    // 리뷰 신고하기
    public boolean reportReview(Long reviewId) {
        Optional<Review> optionalReview = reviewRepository.findById(reviewId);
        if (optionalReview.isPresent()) {
            Review review = optionalReview.get();
            review.setReported(true);// isReported 필드 수정
            reviewRepository.save(review); // 변경 내용 저장 (업데이트)
            return true;
        }
        return false;
    }

    // 관리자용: 리뷰 ID로 리뷰 삭제
    @Transactional
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}
