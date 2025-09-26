package com.example.faishion.order;


import lombok.Data;

// ✅ 바로 구매 시 옵션 정보를 담을 DTO 정의
// 이 클래스는 프론트엔드의 selectedOptions 배열 내 객체와 구조가 동일해야 합니다.
@Data
public class OrderItemRequestDTO {
    private String color;
    private String size;
    private int quantity;
    private Long productId;
   // private int price;
    //private int stockQuantity; // 이 필드는 백엔드에서 필요 없을 수 있지만, 정확한 데이터 매핑을 위해 포함
}