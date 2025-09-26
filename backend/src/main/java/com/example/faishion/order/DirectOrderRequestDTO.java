package com.example.faishion.order;

import lombok.Data;

import java.util.List;

@Data
public class DirectOrderRequestDTO {
    private Long productId;
    private List<OrderItemRequestDTO> items;
}
