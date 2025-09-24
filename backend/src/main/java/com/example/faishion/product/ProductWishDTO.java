package com.example.faishion.product;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 상품 리스트에 필요한 핵심 정보만 포함
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ProductWishDTO {
    private Long id;
    private String name;
    private Integer price;
    private Integer discountPrice;
    private Long mainImageId;
}