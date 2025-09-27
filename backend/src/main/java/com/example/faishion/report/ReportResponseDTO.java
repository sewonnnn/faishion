package com.example.faishion.report;

import com.example.faishion.review.Review;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
public class ReportResponseDTO {
    private Long id;
    private Long reviewId; // 신고된 리뷰 ID
    private String reporterId; // 신고자 ID
    private String reason; // 신고 사유
    private String description; // 상세 설명
    private String status;
    private String createdAt;

    // 리뷰 세부 정보
    private String reviewContent;
    private Integer reviewRating;

    // Report 엔티티를 DTO로 변환하는 생성자
    public ReportResponseDTO(Report report) {
        this.id = report.getId();
        this.reason = report.getReason();
        this.description = report.getDescription();
        this.status = report.getStatus();
        this.createdAt = report.getCreatedAt() != null ? report.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : null;

        // User와 Review는 이미 FETCH JOIN으로 로드되었기 때문에 안전하게 접근 가능
        if (report.getReporter() != null) {
            this.reporterId = report.getReporter().getId();
        }

        if (report.getReview() != null) {
            Review review = report.getReview();
            this.reviewId = review.getId();
            this.reviewContent = review.getContent();
            this.reviewRating = review.getRating();
            // Review 엔티티 내부의 다른 필드는 가져오지 않아 순환 참조 가능성 차단
        }
    }
}