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
    private String productName; // 상품명 (product에서 가져옴)
    private String productColor; // 상품 색상 (Stock에서 가져옴)
    private String productSize; // 상품 사이즈 (Stock에서 가져옴)
    private double productPrice; // 상품 가격 (product에서 가져옴)
    private double discountedProductPrice; // 할인 적용된 상품 가격
    private Long productImageId; // 이미지 링크 (Stock에서 가져옴)

    private String sellerBusinessName; // 판매자 상호명

//    public CartProductDTO(Cart cart) {
//        this.id = cart.getId();
//        this.userId = cart.getUser().getId();
//        this.stockId = cart.getStock().getId();
//        this.quantity = cart.getQuantity();
//    }

    //    public CartProductDTO(Long id, int quantity, Long productId, String productName, double productPrice, String productImageUrl) {
//        this.id = id;
//        this.quantity = quantity;
//        this.productId = productId;
//        this.productName = productName;
//        this.productPrice = productPrice;
//        this.productImageUrl = productImageUrl;
//    }
    public CartProductDTO(Cart cart) {
        this.id = cart.getId();
        this.quantity =  cart.getQuantity();
        this.sellerBusinessName = cart.getStock().getProduct().getSeller().getBusinessName();

        // Cart -> Stock -> Product 순으로 접근하여 데이터 추출
        if (cart.getStock() != null) {
            // Stock에서 Product 정보 추출
            if (cart.getStock().getProduct() != null) {
                this.productName = cart.getStock().getProduct().getName();
                this.productPrice = cart.getStock().getProduct().getPrice();
                this.productSize = cart.getStock().getSize();
                this.productColor = cart.getStock().getColor();
                this.discountedProductPrice = cart.getStock().getProduct().getDiscountPrice();
            }

            // Stock에서 Image 정보 추출
            if (cart.getStock().getImage() != null) {
                this.productImageId = cart.getStock().getImage().getId();
            }
          }
        }
    }
