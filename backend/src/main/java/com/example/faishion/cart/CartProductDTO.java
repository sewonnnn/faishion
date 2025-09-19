package com.example.faishion.cart;

import com.example.faishion.product.Product;
import com.example.faishion.stock.Stock;
import com.example.faishion.user.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자 추가
@AllArgsConstructor // 모든 필드를 포함하는 생성자 추가
public class CartProductDTO {
    private User user;
    private Stock stock;
    private Integer quantity;
    private Product product;
}
