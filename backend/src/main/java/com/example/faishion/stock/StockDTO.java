package com.example.faishion.stock;

import com.example.faishion.product.Product;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자 추가
@AllArgsConstructor // 모든 필드를 포함하는 생성자 추가
public class StockDTO {
    private Long id;
    private String color; //상품 색상
    private String size; //상품 사이즈
    private Integer quantity; //상품 재고 수량
    private Long productId; // 상품

    public StockDTO(Stock stock) {
        this.id = stock.getId();
        this.color = stock.getColor();
        this.size = stock.getSize();
        this.quantity = stock.getQuantity();
    }
}
