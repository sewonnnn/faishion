package com.example.faishion.product;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name; // 상품명
    private String description; // 상품 설명
    private Integer price;
    private String thumbnailUrl; // 대표 이미지

    // 연관 판매자
    private Long sellerId;
    private String sellerName;

    public ProductDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();


    }

}
