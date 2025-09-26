package com.example.faishion.order;

import com.example.faishion.payment.Payment;
import com.example.faishion.cart.CartRepository;
import com.example.faishion.payment.PaymentRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;


    public Order findOrderWithItems(String clientOrderId) {
        return orderRepository.findByClientOrderId(clientOrderId).orElse(null);
    }

    @Transactional
    public Payment recordSuccessPaymentAndCompleteOrder(String clientOrderId,
                                                        String paymentKey,
                                                        String paymentType,
                                                        int amount) {
        // 1) 주문 조회 (clientOrderId 기준)
        Order order = orderRepository.findByClientOrderId(clientOrderId)
                .orElseThrow(() -> new IllegalArgumentException("주문 없음: " + clientOrderId));

        // 2) (권장) 금액 검증 – 위·변조 방지
        // Order.totalAmount 이 double 이므로 반올림/캐스팅 주의
        int orderAmount = (int) Math.round(order.getTotalAmount());
        if (orderAmount != amount) {
            throw new IllegalStateException("결제 금액 불일치 (order=" + orderAmount + ", paid=" + amount + ")");
        }

        // 3) (idempotency) 이미 같은 paymentKey로 저장된 결제가 있는지 확인
        if (paymentRepository.findByPaymentKey(paymentKey).isPresent()) {
            // 이미 처리된 건이면 그대로 반환하거나 예외 처리
            // 여기선 기존 결제를 반환해 idempotent 하게 유지
            return paymentRepository.findByPaymentKey(paymentKey).get();
        }

        // 4) Payment 생성/저장
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUser(order.getUser());
        payment.setPaymentKey(paymentKey);
        payment.setPaymentType(paymentType); // 카드/가상계좌 등
        payment.setAmount(amount);
        paymentRepository.save(payment);

        // 5) 주문 상태 업데이트
        order.setStatus("COMPLETED");
        orderRepository.save(order);

        return payment;
    }

    public Page<Order> getOrdersBySellerId(String sellerId, Pageable pageable) {
        return orderRepository.findOrdersBySellerId(sellerId, pageable);
    }

    public void createOrderFromCartItems(List<Long> cartIds) {

    }

}
