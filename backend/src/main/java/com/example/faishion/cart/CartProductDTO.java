package com.example.faishion.cart;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자 추가
@AllArgsConstructor // 모든 필드를 포함하는 생성자 추가
public class CartProductDTO {
    private Long id;
    private String userId;   // User 객체 대신 userId만
    private Long stockId;
    private Integer quantity;

    private Long productId; // 상품 ID 추가
    private String productName; // 상품명
    private double productPrice; // 상품 가격
    private String productImageUrl; // 이미지 링크

    public CartProductDTO(Cart cart) {
        this.id = cart.getId();
        this.userId = cart.getUser().getId();
        this.stockId = cart.getStock().getId();
        this.quantity = cart.getQuantity();
    }

    public CartProductDTO(Long id, int quantity, Long productId, String productName, double productPrice, String productImageUrl) {
        this.id = id;
        this.quantity = quantity;
        this.productId = productId;
        this.productName = productName;
        this.productPrice = productPrice;
        this.productImageUrl = productImageUrl;
    }

}
