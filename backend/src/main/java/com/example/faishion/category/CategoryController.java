package com.example.faishion.category;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/category")
public class CategoryController {
    private final CategoryService categoryService;

    // 전체 중분류 + 소분류 조회
    @GetMapping("/groups")
    public List<CategoryGroupDTO> getAllGroups(@AuthenticationPrincipal String userId) {
        System.out.println(userId);
        return categoryService.getAllGroupsWithCategories();
    }

    // 소분류 전체 조회
    @GetMapping
    public List<CategoryDTO> getAllCategories() {
        return categoryService.getAllCategories();
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
