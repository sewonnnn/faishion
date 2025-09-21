package com.example.faishion.review;

import com.example.faishion.image.Image;
import com.example.faishion.image.ImageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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

    // 리뷰 저장
    @Transactional
    public Review saveReviewWithImages(Review review, List<MultipartFile> imageFiles) throws IOException {
        // 1. Review 엔티티 먼저 저장
        Review savedReview = reviewRepository.save(review);

        for (MultipartFile file : imageFiles) {
            Image image = imageService.saveImage(file);
            savedReview.getImageList().add(image);
        }

//        // 2. 이미지 파일 처리
//        List<ReviewImage> reviewImages = new ArrayList<>();
//        if (imageFiles != null && !imageFiles.isEmpty()) {
//            for (MultipartFile file : imageFiles) {
//                if (!file.isEmpty()) {
//                    // 파일 저장 및 ReviewImage 엔티티 생성
//                    ReviewImage reviewImage = saveImage(file, savedReview);
//                    reviewImages.add(reviewImage);
//                }
//            }
//        }
//
//        // 3. 모든 이미지 엔티티를 한 번에 저장
//        if (!reviewImages.isEmpty()) {
//            reviewImageRepository.saveAll(reviewImages);
//        }

        return savedReview;
    }

//    // 리뷰 이미지 저장
//    private ReviewImage saveImage(MultipartFile file, Review review) throws IOException {
//        String uploadDir = "C:/uploads/"; // 실제 서버 경로로 변경 (운영 환경에서는 S3 등 클라우드 스토리지 사용 권장)
//        Path uploadPath = Paths.get(uploadDir);
//        if (!Files.exists(uploadPath)) {
//            Files.createDirectories(uploadPath);
//        }
//
//        String originalFilename = file.getOriginalFilename();
//        String savedFilename = UUID.randomUUID().toString() + "_" + originalFilename;
//        Path filePath = uploadPath.resolve(savedFilename);
//
//        Files.copy(file.getInputStream(), filePath); // 파일 저장
//
//        ReviewImage reviewImage = new ReviewImage();
//        reviewImage.setOriginName(originalFilename);
//        reviewImage.setSavedName(savedFilename);
//        reviewImage.setReview(review); // 리뷰 엔티티와 연결
//
//        return reviewImage;
//    }

    // 리뷰목록 불러오기
    List<Review> findByProduct_Id(Long productId){
        return reviewRepository.findByProduct_Id(productId);
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
}
