package com.example.faishion.seller.report;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SellerReportDTO {
    private Long productId; // 신고된 상품 번호
    private String reason; // 신고 종류
    private String description; // 신고 사유

}
