package com.example.faishion.category;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryGroupDTO {
    private Long id;                    // 그룹 ID
    private String name;                // 그룹 이름
    private List<CategoryDTO> categories;  // 그룹에 속한 카테고리 목록
}