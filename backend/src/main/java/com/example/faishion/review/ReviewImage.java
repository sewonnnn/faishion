package com.example.faishion.review;

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
@Table(name = "review_image")
public class ReviewImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originName;  // 실제 파일 이름
    private String savedName;   // 저장된 파일 이름
    private String type;        // MAIN, DETAIL, THUMBNAIL 등

    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Review review;
}