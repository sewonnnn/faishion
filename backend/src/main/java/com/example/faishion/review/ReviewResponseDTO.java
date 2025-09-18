package com.example.faishion.review;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Long id;
    private String userName; // 작성자 이름
    private String content; // 리뷰 내용
    private Integer rating; // 별점
    private String createdAt; // 작성 날짜
}
