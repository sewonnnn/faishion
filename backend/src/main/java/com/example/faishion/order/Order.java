package com.example.faishion.order;

import com.example.faishion.address.Address;
import com.example.faishion.coupon.Coupon;
import com.example.faishion.delivery.Delivery;
import com.example.faishion.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    private String zipcode; //우편번호
    private String street; //도로명 주소
    private String detail; //상세주소
    private String requestMsg; // 요청사항


    private String status; // 주문 상태 (PENDING, COMPLETED, FAILED 등)

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItemList = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Delivery> deliveryList;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ⭐⭐ 결제 연동을 위한 최소 필수 필드 추가 ⭐⭐
    @Column(nullable = false, unique = true) // 토스페이먼츠와 통신할 고유 주문 ID
    private String clientOrderId;

    @Column(nullable = false) // 결제창에 표시될 주문명 (예: "상품명 외 N건")
    private String orderName;

    @Column(nullable = false) // 최종 결제 금액 (백엔드 검증에 필수)
    private double totalAmount;

}
