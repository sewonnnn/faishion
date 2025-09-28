package com.example.faishion.order;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// 바로 구매 요청 시 사용되는 dto
@Data
@NoArgsConstructor
public class DirectOrderRequestDTO {
    private Long productId;
    private List<OrderItemRequestDTO> items;
}
