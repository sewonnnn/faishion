package com.example.faishion.category;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryGroupRepository categoryGroupRepository;

    @Transactional(readOnly = true)
    public List<CategoryGroupDTO> getAllGroupsWithCategories() {
        List<CategoryGroup> groups = categoryGroupRepository.findAllWithCategories();

        return groups.stream()
                .map(group -> new CategoryGroupDTO(
                        group.getId(),
                        group.getName(),
                        group.getCategoryList().stream()
                                .map(c -> new CategoryDTO(c.getId(), c.getName()))
                                .toList()
                )).toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(c -> new CategoryDTO(c.getId(), c.getName()))
                .toList();
    }

    public void addCategoryGroup(CategoryGroup categoryGroup) {
        categoryGroupRepository.save(categoryGroup);
    }

    public void addCategory(Category category) {
        categoryRepository.save(category);
    }
}
