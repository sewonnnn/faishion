package com.example.faishion.user;

import com.example.faishion.address.Address;
import com.example.faishion.cart.Cart;
import com.example.faishion.coupon.Coupon;
import com.example.faishion.image.Image;
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


import java.awt.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name="uk_users_email", columnNames="email"),
                @UniqueConstraint(name="uk_users_phone", columnNames="phone_number"),
                @UniqueConstraint(name="uk_users_username", columnNames="username"),
                @UniqueConstraint(name="uk_users_provider_uid", columnNames={"provider","provider_user_id"})
        })
public class User {

    @Id
    @Column(length = 36)
    private String id; // 항상 UUID (LOCAL/소셜 모두)

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private AuthProvider provider; // LOCAL, NAVER, KAKAO

    @Column(name="provider_user_id", length=100)
    private String providerUserId; // LOCAL일 땐 null

    // 로컬 로그인용 사용자 아이디 // 소셜은 null 가능
    @Column(length = 30)
    private String username;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name="phone_number", nullable=false, length=20)
    private String phoneNumber;

    @Column(name="pw_hash", length=100) // LOCAL만 사용 // 소셜은 null
    private String pwHash; //Spring Security 암호화

    @OneToOne
    @JoinColumn(name = "image_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Image image;

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


    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
