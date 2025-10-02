package com.example.faishion.qna;

import com.example.faishion.admin.Admin;
import com.example.faishion.product.Product;
import com.example.faishion.seller.Seller;
import com.example.faishion.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "qna")
public class Qna {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY) //상품 아이디
    @JoinColumn(name = "product_id", nullable = true)
    private Product product;

    private String title; //질문제목

    @Column(length = 2000)
    private String content; //질문내용

    @Column(length = 2000)
    private String answer; //답변내용

    private String qnaType; // "PRODUCT" (상품문의) 또는 "GENERAL" (일반문의)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answered_by_seller")
    private Seller answeredBySeller; //답변한 판매자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answered_by_admin")
    private Admin answeredByAdmin; //답변한 관리자

    private boolean isSecret;
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
