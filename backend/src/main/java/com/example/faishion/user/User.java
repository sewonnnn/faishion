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


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name="uk_users_email", columnNames="email"),
                @UniqueConstraint(name="uk_users_phone", columnNames="phone_number"),
                @UniqueConstraint(name="uk_users_provider_uid", columnNames={"provider","provider_user_id"})
        })
public class User {

    // 수정
    @Id
    @Column(length = 100)
    private String id; // 로컬 : 사용자 입력 아이디 , 소셜: provider userId

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private AuthProvider provider; // LOCAL, NAVER

    @Column(name="provider_user_id", length=100)
    private String providerUserId; // LOCAL일 땐 null

    @Column(nullable = false, length = 60)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name="phone_number", nullable=false, length=20)
    private String phoneNumber;

    private int height;
    private int weight;

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
