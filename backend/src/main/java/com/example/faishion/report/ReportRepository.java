package com.example.faishion.report;


import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // 🚨 특정 reviewId에 해당하는 모든 Report 엔티티를 삭제하는 JPQL
    @Modifying
    @Transactional
    @Query("DELETE FROM Report r WHERE r.review.id = :reviewId")
    void deleteByReviewId(@Param("reviewId") Long reviewId);
}
