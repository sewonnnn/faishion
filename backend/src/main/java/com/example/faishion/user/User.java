package com.example.faishion.user;

import com.example.faishion.address.Address;
import com.example.faishion.cart.Cart;
import com.example.faishion.coupon.Coupon;
import com.example.faishion.image.Image;
import com.example.faishion.notification.Notification;
import com.example.faishion.order.Order;
import com.example.faishion.wish.Wish;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name="uk_users_email", columnNames="email"),
                @UniqueConstraint(name="uk_users_phone", columnNames="phone_number"),
                @UniqueConstraint(name="uk_users_loginid", columnNames="login_id"),
                @UniqueConstraint(name="uk_users_provider_uid", columnNames={"provider","provider_user_id"})
        })
public class User {

    @Id
    @Column(length = 100)
    private String id; // 시스템 내부 PK (UUID or PROVIDER_userId)

    @Column(name = "login_id", length = 50, unique = true)
    private String loginId; // Local 전용 로그인 ID (소셜이면 null) //사용자 입력 id

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private AuthProvider provider; // LOCAL, NAVER

    // 수정
    @Column(name="provider_user_id", length=200)
    private String providerUserId; // 소셜 provider 고유 ID, Local은 null

    @Column(nullable = false, length = 60)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name="phone_number", nullable=false, length=20)
    private String phoneNumber;

    private int height;
    private int weight;


    @Column(name = "pw_hash", length=100) // Local만 사용, 소셜은 null
    private String pwHash;

    @OneToOne
    @JoinColumn(name = "image_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Image image;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addressList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orderList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Coupon> couponList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cart> cartList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Wish> wishList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notificationList = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // 헬퍼 메소드
    public static User createLocal(String loginId, String email, String pwHash,
                                   String name, String phoneNumber) {
        User u = new User();
        u.setId(UUID.randomUUID().toString());
        u.setLoginId(loginId);
        u.setProvider(AuthProvider.LOCAL);
        u.setEmail(email);
        u.setPwHash(pwHash);
        u.setName(name);
        u.setPhoneNumber(phoneNumber);
        return u;
    }
}
