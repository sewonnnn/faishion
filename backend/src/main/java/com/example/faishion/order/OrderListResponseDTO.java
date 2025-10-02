package com.example.faishion.order;

import com.example.faishion.stock.Stock;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
public class OrderListResponseDTO {

    // --- 주문 기본 정보 ---
    private Long orderId;        // 주문 ID (주문 그룹의 고유 식별자)
    private String orderStatus;  // 주문 상태 ("PENDING", "SHIPPED", "DELIVERED" 등)
    private String orderDate;    // 주문 날짜 (필요하다면 Date/String 타입으로 추가)
    private String userId;

    // --- 주문 항목(상품) 정보 ---
    private Long orderItemId;    // 주문 항목 ID (각 상품 라인의 고유 식별자)
    private Long productId;
    private Long productImageId; // 프론트에서 이미지 URL을 생성하기 위한 ID
    private String productName;
    private int quantity;        // 주문 수량
    private String sellerBusinessName; // 판매자 정보

    // --- 가격 및 옵션 정보 ---
    private long originalPrice;      // 정가 (취소선 표시용)
    private long discountedPrice;    // 최종 결제 단가 (주문 시점 가격)
    private String productColor;
    private String productSize;

    // OrderItem 엔티티를 DTO로 변환하는 생성자
    public OrderListResponseDTO(OrderItem orderItem) {
        // 주문 정보
        this.orderId = orderItem.getOrder().getId();
        this.orderStatus = orderItem.getOrder().getStatus();
        this.orderDate = orderItem.getOrder().getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")); // 필요 시 추가

        // 상품 정보
        Stock stock = orderItem.getStock();
        this.orderItemId = orderItem.getId();
        this.productId = stock.getProduct().getId();
        // stock.getImage()가 null일 수 있으므로 null 체크 필요
        this.productImageId = stock.getImage() != null ? stock.getImage().getId() : null;
        this.productName = stock.getProduct().getName();
        this.quantity = orderItem.getQuantity();
        this.sellerBusinessName = stock.getProduct().getSeller().getBusinessName();

        // 가격 및 옵션
        this.productColor = stock.getColor();
        this.productSize = stock.getSize();
        this.originalPrice = stock.getProduct().getPrice(); // Product의 정가
        this.discountedPrice = orderItem.getPrice();        // OrderItem에 저장된 최종 결제 단가
    }
}