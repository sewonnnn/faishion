// src/components/seller/productform/CategorySelector.jsx
import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const CategorySelector = ({
                              categoryGroups,
                              selectedGroup,
                              selectedCategory,
                              onGroupChange,
                              onCategoryChange,
                          }) => {
    // 선택된 그룹에 해당하는 소분류 목록을 계산합니다.
    const categoriesForSelectedGroup = selectedGroup
        ? categoryGroups.find(group => group.id == selectedGroup)?.categories || []
        : [];

    return (
        <>
            <Form.Group as={Row} className="mb-3" controlId="formCategoryGroup">
                <Form.Label column sm="2">상품 카테고리 :</Form.Label>
                <Col sm="10">
                    <Form.Select onChange={onGroupChange} value={selectedGroup}>
                        <option value="">-- 카테고리 그룹 선택 --</option>
                        {categoryGroups.map(group => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="formSubCategory">
                <Form.Label column sm="2">카테고리 :</Form.Label>
                <Col sm="10">
                    <Form.Select
                        onChange={onCategoryChange}
                        value={selectedCategory}
                        disabled={!selectedGroup}
                    >
                        <option value="">-- 카테고리 선택 --</option>
                        {categoriesForSelectedGroup.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Form.Group>
        </>
    );
};

export default CategorySelector;