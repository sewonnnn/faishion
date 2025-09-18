package com.example.faishion.user;

import com.example.faishion.address.Address;
import com.example.faishion.cart.Cart;
import com.example.faishion.coupon.Coupon;
import com.example.faishion.notification.Notification;
import com.example.faishion.order.Order;
import com.example.faishion.wish.Wish;
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
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_phone", columnNames = "phone_number"),
                @UniqueConstraint(name = "uk_users_provider_uid", columnNames = {"provider", "provider_user_id"})
        })
public class User {
    // 소셜에서 받은 UUID 저장 -> ID로 , 소셜 식별자 분리
    @Id
    @Column(length = 36)
    private String id;  //oauth일 때 oauth의 고유 id가 여기에 들어감 // UUID 문자열

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AuthProvider provider; // LOCAL, NAVER, KAKAO

    @Column(length = 100)
    private String providerUserId; // 소셜에서 내려온 고유 식별자 (nullable: LOCAL일 때 null)

    //private String provider; //oauth 제공자 ex) naver, kakao, 일반사용자 일시 null

    @Column(nullable = false, length = 60)
    private String name;

    @Column(nullable = false, length = 100)
    private String email; //사용자 이메일

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Column(length = 100)
    private String pwHash; //Spring Security 암호화

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Address> addressList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Order> orderList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Coupon> couponList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Cart> cartList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Wish> wishList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Notification> notificationList = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserImage userImage;


    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void updateUser(UserDTO dto) {
        // 추후 작성
    }
}
