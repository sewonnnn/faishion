package com.example.faishion.review;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    // 리뷰 저장
    Review save(Review review) {
        return reviewRepository.save(review);
    }

    // 리뷰목록 불러오기
    List<Review> findByProduct_Id(Long productId){
        return reviewRepository.findByProduct_Id(productId);
    }
}
