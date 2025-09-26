package com.example.faishion.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review,Long> {

    Page<Review> findByProduct_Id(Long productId, Pageable pageable);

    // 리뷰 별점평균 찾기
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Optional<Double> findAverageRatingByProductId(@Param("productId") Long productId);

    // 리뷰 갯수 찾기
    @Query("SELECT COUNT(r.id) FROM Review r WHERE r.product.id = :productId")
    Optional<Integer> findCountByProductId(@Param("productId") Long productId);
}
