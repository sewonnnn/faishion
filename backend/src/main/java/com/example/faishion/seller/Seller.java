package com.example.faishion.seller;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Table(name = "seller")
public class Seller {
    @Id
    private String id; //판매자는 oauth 로그인이 불가능해야함, 무조건 자체 로그인

    @Column(nullable = false)
    private String email; //판매자 이메일

    @Column(nullable = false)
    private String phoneNumber; //판매자 휴대폰번호

    private String password; //Spring Security  pwHash 암호화

    private String businessName; //상호명

    private String businessNumber; //사업자번호

    private String ownerName; //대표이름

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
