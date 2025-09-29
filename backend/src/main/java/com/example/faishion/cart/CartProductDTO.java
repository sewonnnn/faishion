package com.example.faishion.cart;

import com.example.faishion.order.OrderItem;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자 추가
@AllArgsConstructor // 모든 필드를 포함하는 생성자 추가
public class CartProductDTO {
    private Long id; // cartId
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
    private String zipcode; // 우편번호

    private String sellerBusinessName; // 판매자 상호명

    public CartProductDTO(Cart cart) {
        this.id = cart.getId();
        this.quantity =  cart.getQuantity();
        this.sellerBusinessName = cart.getStock().getProduct().getSeller().getBusinessName();

        //객체 접근 전에 null 체크
        if (cart.getStock() != null) {
            this.stockId = cart.getStock().getId();
            this.productColor = cart.getStock().getColor();
            this.productSize = cart.getStock().getSize();

            if (cart.getStock().getImage() != null) {
                this.productImageId = cart.getStock().getImage().getId();
            }

            if (cart.getUser() != null) {
                this.userId = cart.getUser().getId();
            }

            if (cart.getStock().getProduct() != null) {
                this.sellerBusinessName = cart.getStock().getProduct().getSeller().getBusinessName();
                this.productId = cart.getStock().getProduct().getId();
                this.productName = cart.getStock().getProduct().getName();
                this.productPrice = cart.getStock().getProduct().getPrice();

                Integer discountPrice = cart.getStock().getProduct().getDiscountPrice();

                if (discountPrice != null) {
                    // Integer 값을 double
                    this.discountedProductPrice = discountPrice.doubleValue();
                } else {
                    this.discountedProductPrice = this.productPrice;
                }
            }
        }

          }

    // OrderItem 엔티티를 받아 DTO를 생성하는 생성자 추가 (선택한 상품의 상세내용을 보기 위함)
    public CartProductDTO(OrderItem orderItem) {
        this.id = orderItem.getId(); // OrderItem의 ID를 사용
        this.quantity = orderItem.getQuantity();
        this.discountedProductPrice = (double) orderItem.getPrice(); // 최종 확정 가격

        if (orderItem.getStock() != null) {
            this.stockId = orderItem.getStock().getId();
            this.productColor = orderItem.getStock().getColor();
            this.productSize = orderItem.getStock().getSize();

            if (orderItem.getStock().getImage() != null) {
                this.productImageId = orderItem.getStock().getImage().getId();
            }

            if (orderItem.getStock().getProduct() != null) {
                this.sellerBusinessName = orderItem.getStock().getProduct().getSeller().getBusinessName();
                this.productId = orderItem.getStock().getProduct().getId();
                this.productName = orderItem.getStock().getProduct().getName();
                this.productPrice = orderItem.getStock().getProduct().getPrice(); // 원가
            }
        }

        if (orderItem.getOrder() != null && orderItem.getOrder().getUser() != null) {
            this.userId = orderItem.getOrder().getUser().getId();
        }
    }
        }
