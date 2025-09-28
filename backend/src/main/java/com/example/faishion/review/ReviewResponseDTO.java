package com.example.faishion.review;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;
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
    private List<String> imageUrls; // 이미지 경로
    private String productName; // 리뷰대상 상품이름
    private Long productId; // 상품아이디

    public ReviewResponseDTO(Long id, String userName, String content, Integer rating, String createdAt, List<String> imageUrls, String productName) {
        this.id = id;
        this.userName = userName;
        this.content = content;
        this.rating = rating;
        this.createdAt = createdAt;
        this.imageUrls = imageUrls;
        this.productName = productName;
    }
}
