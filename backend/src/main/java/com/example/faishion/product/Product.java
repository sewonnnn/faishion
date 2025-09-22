package com.example.faishion.product;

import com.example.faishion.category.Category;
import com.example.faishion.image.Image;
import com.example.faishion.review.Review;
import com.example.faishion.seller.Seller;
import com.example.faishion.stock.Stock;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.boot.autoconfigure.domain.EntityScan;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; //상품명
    @Column(length = 2000)
    private String description; //상품 설명
    private Integer price; //기본 가격
    private Integer status; // '판매 게시' 또는 '판매 중지' 상태
    private Integer discountPrice;
    private LocalDateTime discountStartDate;
    private LocalDateTime discountEndDate;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Image> mainImageList = new HashSet<>(); // 썸네일

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Image> detailImageList = new HashSet<>(); // 상세에 나오는 바디 사진

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Stock> stockList = new HashSet<>(); //상품 옵션(재고)

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Review> reviewList = new HashSet<>(); //상품 옵션(재고)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Seller seller; //연관 판매자

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Product(Long productId) {
        this.id = productId;
    }
}
