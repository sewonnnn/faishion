// src/main/java/com/example/faishion/payment/PaymentController.java
package com.example.faishion.payment;

import com.example.faishion.cart.CartProductDTO;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // @Slf4j를 사용하여 Logger를 간편하게 사용
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
// import org.springframework.web.client.RestTemplate; // 현재 코드에서 사용하지 않으므로 제거 가능

import java.util.List; // PaymentDTO에서 List를 사용하므로 필요

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j // Logger를 직접 선언하는 대신 사용
public class PaymentController {
    private final PaymentRepository paymentRepository;

    // private final Logger logger = LoggerFactory.getLogger(this.getClass()); // @Slf4j 사용 시 제거

    @PostMapping("/confirm")
    public ResponseEntity<String> confirmPayment(@RequestBody Payment payment, @AuthenticationPrincipal UserDetails userDetails ) {

        System.out.println(userDetails == null);
        String userId = userDetails.getUsername();
        System.out.println("주문ID : " + payment.getOrder().getId());
        System.out.println("결제 금액 : " + payment.getAmount());
        System.out.println("결제 고유번호 : " + payment.getPaymentKey());
        System.out.println("결제 방식 : " + payment.getPaymentType());
        User user = new User();
        user.setId(userId);
        payment.setUser(user);
        paymentRepository.save(payment);

        return ResponseEntity.ok("결제 승인 요청 수신 및 확인 완료 " +  payment.getId());
    }
}