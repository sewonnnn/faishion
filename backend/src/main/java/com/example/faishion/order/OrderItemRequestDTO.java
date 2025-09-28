package com.example.faishion.order;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
// 바로 구매 시 옵션 정보를 담을 DTO 정의
// 이 클래스는 프론트엔드의 selectedOptions 배열 내 객체와 구조가 동일해야 함
public class OrderItemRequestDTO {
    private String color;
    private String size;
    private int quantity;
    private Long productId;
}