package com.example.faishion.category;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "category", uniqueConstraints = @UniqueConstraint(columnNames = {"category_group_id", "name"}))
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // 소분류 이름

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_group_id", nullable = false)
    private CategoryGroup categoryGroup; // 중분류
}
