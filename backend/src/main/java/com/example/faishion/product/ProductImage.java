package com.example.faishion.product;

import com.example.faishion.image.Image;
import com.example.faishion.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "product_image")
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean isThumbnail = false; //썸네일 이미지인가?
    private Integer displayOrder; // 표시 순서

    @OneToOne
    @JoinColumn(name = "image_id", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Image image; //실제 이미지 테이블과 1:1 매핑

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Product product; //이미지 여러개가 상품 하나에 들어감
}
