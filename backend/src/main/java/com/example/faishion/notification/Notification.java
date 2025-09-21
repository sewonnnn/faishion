package com.example.faishion.notification;

import com.example.faishion.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 알림 받는 대상
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 알림 관련 대상 엔티티 (주문, 배송, 리뷰 등)
    private String type;  // ORDER, DELIVERY, REVIEW, SYSTEM 등

    private Long referenceId; // 해당 type에 대한 참조 ID (예: orderId, reviewId)
    private String title;   // 알림 제목
    private String message; // 알림 내용
    private Boolean isRead = false; // 읽음 여부

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
