package com.example.faishion.payment;

import com.example.faishion.cart.CartProductDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor // 기본 생성자 추가
@AllArgsConstructor // 모든 필드를 포함하는 생성자 추가
public class PaymentDTO {
    private String  orderId;
    private String orderName;
  // private String customerName;
    private int totalAmount;
//    private String paymentKey;
   // private List<CartProductDTO> items;

}
