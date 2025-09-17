package com.example.faishion.category;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/category")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public void GetCategory(){

    }

    // 중분류 추가
    @PostMapping("/group")
    public void addCategoryGroup(@RequestBody CategoryGroup categoryGroup) {
        categoryService.addCategoryGroup(categoryGroup);
    }

    // 소분류 추가
    @PostMapping
    public void addCategory(@RequestBody Category category) {
        categoryService.addCategory(category);
    }
}
