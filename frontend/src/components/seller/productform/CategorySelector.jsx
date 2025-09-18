import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const CategorySelector = () => {
    const [categoryGroups, setCategoryGroups] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        // Fetch all category groups with their subcategories
        const fetchCategoryGroups = async () => {
            try {
                // Replace with your actual API endpoint for groups
                const response = await fetch('/category/groups');
                const data = await response.json();
                setCategoryGroups(data);
            } catch (error) {
                console.error("Error fetching category groups:", error);
            }
        };

        // Fetch all categories (optional, but good for a flat display)
        const fetchAllCategories = async () => {
            try {
                // Replace with your actual API endpoint for all categories
                const response = await fetch('/category');
                const data = await response.json();
                setAllCategories(data);
            } catch (error) {
                console.error("Error fetching all categories:", error);
            }
        };

        fetchCategoryGroups();
        fetchAllCategories();
    }, []);

    const handleGroupChange = (e) => {
        setSelectedGroup(e.target.value);
        setSelectedCategory(''); // Reset subcategory when group changes
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    // Find the selected group's categories
    const categoriesForSelectedGroup = selectedGroup
        ? categoryGroups.find(group => group.id.toString() === selectedGroup)?.categories || []
        : [];

    return (
        <Container className="my-5">
            <h3 className="text-center mb-4">상품 카테고리 선택</h3>
            <Form>
                {/* 중분류 (Main Category) Selection */}
                <Form.Group as={Row} className="mb-3" controlId="formGroupCategory">
                    <Form.Label column sm="3">중분류:</Form.Label>
                    <Col sm="9">
                        <Form.Select onChange={handleGroupChange} value={selectedGroup}>
                            <option value="">-- 중분류 선택 --</option>
                            {categoryGroups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Form.Group>

                {/* 소분류 (Subcategory) Selection */}
                <Form.Group as={Row} className="mb-3" controlId="formSubCategory">
                    <Form.Label column sm="3">소분류:</Form.Label>
                    <Col sm="9">
                        <Form.Select
                            onChange={handleCategoryChange}
                            value={selectedCategory}
                            disabled={!selectedGroup}
                        >
                            <option value="">-- 소분류 선택 --</option>
                            {categoriesForSelectedGroup.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Form.Group>
            </Form>

            {selectedCategory && (
                <div className="mt-4 p-3 border rounded text-center">
                    <p className="mb-0">
                        <strong>선택된 카테고리:</strong> {
                        allCategories.find(cat => cat.id.toString() === selectedCategory)?.name
                    }
                    </p>
                </div>
            )}
        </Container>
    );
};

export default CategorySelector;