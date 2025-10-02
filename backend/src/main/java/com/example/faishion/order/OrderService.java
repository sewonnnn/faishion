package com.example.faishion.order;

import com.example.faishion.payment.Payment;
import com.example.faishion.cart.CartRepository;
import com.example.faishion.payment.PaymentRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
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

    public Page<SellerOrderDTO> getOrdersBySellerId(String sellerId, Pageable pageable) {
        Page<Order> orders = orderRepository.findBySellerId(sellerId, pageable);
        return new PageImpl<>(orders.getContent()
                .stream()
                .map(SellerOrderDTO::new).toList(),
                pageable,
                orders.getTotalElements()
        );
    }

    public void createOrderFromCartItems(List<Long> cartIds) {

    }

    public List<OrderListResponseDTO> getMyOrderHistory(String userId) {
        // Repository 메서드를 호출할 때 전달받은 userId를 사용
        List<OrderItem> orderItems = orderItemRepository.findOrderHistoryByUserId(userId);

        // ... (DTO 변환 후 반환)
        return orderItems.stream()
                .map(OrderListResponseDTO::new)
                .collect(Collectors.toList());
    }

    // 주문 상세 정보를 조회
    @SneakyThrows
    @Transactional
    public Order getOrderDetails(Long orderId, String userId) {

        // 1. Order 엔티티 조회
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("주문 ID " + orderId + "를 찾을 수 없습니다."));

        // 2. 보안 검사: 소유자 확인 (권한이 없거나 주문의 userId 필드가 현재 userId와 다르면 404 처리)
        if (!order.getUser().getId().equals(userId)) {
            // ⭐ 다른 사용자의 주문이라면 '찾을 수 없음' (404)으로 처리하여 정보를 노출하지 않음
            throw new EntityNotFoundException("해당 주문 ID에 대한 접근 권한이 없습니다.");
        }

        // 3. 결제 상태 확인: PENDING 상태 주문은 조회 불가 처리
        if(order.getStatus().equals("PENDING")){
            // ⭐ 결제 실패나 대기 주문은 조회되지 않도록 404 처리
            throw new EntityNotFoundException("결제가 완료되지 않은 주문은 조회할 수 없습니다.");
        }

        // 4. 데이터 준비: Lazy Loading된 OrderItem 목록을 미리 로드(초기화)
        order.getOrderItemList().size();

        // 5. Order 엔티티 반환
        return order;
    }

    // 주문 상태가 COMPLETED인 경우만 가져오기
    public List<OrderListResponseDTO> getCompleteOrder(String username) {
        // 1. Order Repository에서 COMPLETED 상태의 Order 목록을 가져옵니다.
        List<Order> orders = orderRepository.getCompleteOrder(username);

        // 2. Order 엔티티 목록을 OrderItem 기준으로 펼치고 DTO로 변환합니다.
        return orders.stream()
                // 각 Order 내부의 OrderItem 리스트를 스트림으로 펼칩니다.
                .flatMap(order -> order.getOrderItemList().stream())
                // OrderItem을 DTO로 변환합니다.
                .map(OrderListResponseDTO::new)
                .collect(Collectors.toList());
    }
}
