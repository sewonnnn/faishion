package com.example.faishion.report;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private Long reviewId; // 신고된 리뷰번호
    private String reason; // 신고 종류
    private String description; // 신고 사유

}
