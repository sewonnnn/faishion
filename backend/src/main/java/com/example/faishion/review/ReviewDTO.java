package com.example.faishion.review;

import lombok.Data;

@Data // Lombok을 사용해 Getter, Setter 등을 자동 생성
public class ReviewDTO {
    private Long productId;
    private String content;
    // 필요한 경우 추가 필드
}