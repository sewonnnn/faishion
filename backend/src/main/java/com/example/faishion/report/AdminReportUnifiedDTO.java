package com.example.faishion.report;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportUnifiedDTO {
    private Long id; // 신고 고유 ID (ReviewReport 또는 SellerReport의 ID)
    private String type; // 신고 유형: "REVIEW" 또는 "SELLER"
    private String reason; // 신고 사유
    private String description; // 상세 설명
    private String status; // 처리 상태 (SellerReport에만 status 필드가 있다고 가정)
    private String reporterId; // 신고자 ID (Username)
    private Long targetId; // 💡 신고 대상의 고유 ID (Review ID, Product ID 등)
    private String contentPreview; // 💡 신고 대상 내용 미리보기 (리뷰 내용, 판매자 상호명)
    private LocalDateTime createdAt;
}
