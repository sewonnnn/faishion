package com.example.faishion.review;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long productId;
    private String userId;
    private String content;
    private int rating;
}
