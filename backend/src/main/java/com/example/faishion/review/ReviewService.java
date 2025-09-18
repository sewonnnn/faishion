package com.example.faishion.review;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    // 리뷰 저장
    Review save(Review review) {
        return reviewRepository.save(review);
    }
}
