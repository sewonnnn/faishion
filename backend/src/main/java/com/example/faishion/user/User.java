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
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user")
public class User {
    @Id
    private String id;  //oauth일 때 oauth의 고유 id가 여기에 들어감

    private String provider; //oauth 제공자 ex) naver, kakao, 일반사용자 일시 null

    private String name;

    @Column(nullable = false)
    private String email; //사용자 이메일

    @Column(nullable = false)
    private String phoneNumber;

    private String pwHash; //Spring Security 암호화

    @OneToOne
    @JoinColumn(name = "image_id", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
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

    public void updateUser(UserDTO dto) {
        // 추후 작성
    }
}
