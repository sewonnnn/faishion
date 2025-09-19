package com.example.faishion.product;

import com.example.faishion.category.Category;
import com.example.faishion.image.Image;
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
import java.util.List;

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

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> mainImageList = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> detailImageList = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Stock> stockList = new ArrayList<>(); //상품 옵션(재고)

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
