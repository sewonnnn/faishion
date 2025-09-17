package com.example.faishion.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryGroupRepository extends JpaRepository<CategoryGroup, Long> {
    @Query("SELECT DISTINCT g FROM CategoryGroup g LEFT JOIN FETCH g.categoryList")
    List<CategoryGroup> findAllWithCategories();
}
