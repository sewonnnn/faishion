package com.example.faishion.order;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequestDTO {
    private Long userId; // JSON의 "userId"와 매핑
    private Long addressId; // JSON의 "addressId"와 매핑
    private String orderName; // JSON의 "orderName"과 매핑
    private double totalAmount; // JSON의 "totalAmount"와 매핑
    private List<OrderItemDTO> items; // JSON의 "items" 배열과 매핑


    // ⭐ OrderItemDTO를 OrderCreateRequestDTO 내부에 정적 클래스로 정의
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private Long stockId;
        private int quantity;
        private int price; // 할인이 적용된 최종 가격
    }
}
