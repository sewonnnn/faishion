package com.example.faishion.user;

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
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true, unique = true)
    private String loginId; //로그인 아이디

    @Column(nullable = false, unique = true)
    private String email; //사용자 이메일

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    private String pwHash; //Spring Security 암호화

    private String name;

    private boolean isAdmin;

    private boolean isSeller;

    private boolean isCustomer;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
