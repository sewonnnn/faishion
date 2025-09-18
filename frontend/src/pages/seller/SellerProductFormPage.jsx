import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios'; // Import axios
import 'bootstrap/dist/css/bootstrap.min.css';

const SellerProductFormPage = () => {
    const [product, setProduct] = useState({
        name: '',
        status: '판매 중',
        price: '',
        category: '',
        discount: '',
        discountPrice: '',
        discountStartDate: '2025-09-16T17:00',
        discountEndDate: '2025-09-20T17:00',
        mainImage: null,
        detailImages: [],
    });

    const [categoryGroups, setCategoryGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchCategoryGroups = async () => {
            try {
                // Change from fetch to axios.get
                const response = await axios.get('http://localhost:8080/category/groups');
                // Axios automatically parses JSON, so you access data via response.data
                setCategoryGroups(response.data);
            } catch (error) {
                console.error("Error fetching category groups:", error);
            }
        };
        fetchCategoryGroups();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prevProduct) => ({
            ...prevProduct,
            [name]: value,
        }));
    };

    const handleCategoryGroupChange = (e) => {
        setSelectedGroup(e.target.value);
        setSelectedCategory('');
        setProduct((prevProduct) => ({
            ...prevProduct,
            category: '', // Reset the category value in the product state
        }));
    };

    const handleSubCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setProduct((prevProduct) => ({
            ...prevProduct,
            category: e.target.value, // Update the category value in the product state
        }));
    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        if (name === 'mainImage') {
            setProduct((prevProduct) => ({
                ...prevProduct,
                mainImage: files[0],
            }));
        } else if (name === 'detailImages') {
            setProduct((prevProduct) => ({
                ...prevProduct,
                detailImages: [...files],
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Product to be registered:', product);
        // Add logic here to submit the form data to an API using Axios
        // For example: axios.post('/your-api-endpoint', product);
    };

    const categoriesForSelectedGroup = selectedGroup
        ? categoryGroups.find(group => group.id.toString() === selectedGroup)?.categories || []
        : [];

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">상품 등록</h2>
            <Form onSubmit={handleSubmit}>
                {/* 상품명 */}
                <Form.Group as={Row} className="mb-3" controlId="formProductName">
                    <Form.Label column sm="2">상품명 :</Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            placeholder="상품명 입력"
                        />
                    </Col>
                </Form.Group>

                {/* 판매 상태 */}
                <Form.Group as={Row} className="mb-3" controlId="formProductStatus">
                    <Form.Label column sm="2">판매 상태 :</Form.Label>
                    <Col sm="10">
                        <Form.Select
                            name="status"
                            value={product.status}
                            onChange={handleChange}
                        >
                            <option value="판매 중">판매 중</option>
                            <option value="일시 품절">일시 품절</option>
                        </Form.Select>
                    </Col>
                </Form.Group>

                {/* 상품 가격 */}
                <Form.Group as={Row} className="mb-3" controlId="formProductPrice">
                    <Form.Label column sm="2">상품 가격 :</Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            placeholder="상품 가격 입력"
                        />
                    </Col>
                </Form.Group>

                {/* 상품 카테고리 - 중분류 */}
                <Form.Group as={Row} className="mb-3" controlId="formCategoryGroup">
                    <Form.Label column sm="2">상품 카테고리 :</Form.Label>
                    <Col sm="10">
                        <Form.Select
                            onChange={handleCategoryGroupChange}
                            value={selectedGroup}
                        >
                            <option value="">-- 중분류 선택 --</option>
                            {categoryGroups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Form.Group>

                {/* 상품 카테고리 - 소분류 */}
                <Form.Group as={Row} className="mb-3" controlId="formSubCategory">
                    <Form.Label column sm="2">소분류 :</Form.Label>
                    <Col sm="10">
                        <Form.Select
                            onChange={handleSubCategoryChange}
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

                {/* 상품 할인율 */}
                <Form.Group as={Row} className="mb-3" controlId="formProductDiscount">
                    <Form.Label column sm="2">상품 할인율 :</Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="number"
                            name="discount"
                            value={product.discount}
                            onChange={handleChange}
                            placeholder="할인율 입력 (숫자만)"
                        />
                    </Col>
                </Form.Group>

                {/* 할인 금액 */}
                <Form.Group as={Row} className="mb-3" controlId="formProductDiscountPrice">
                    <Form.Label column sm="2">할인 금액 :</Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="number"
                            name="discountPrice"
                            value={product.discountPrice}
                            onChange={handleChange}
                            placeholder="할인 금액 자동 계산"
                            disabled
                        />
                    </Col>
                </Form.Group>

                {/* 할인 기간 */}
                <Form.Group as={Row} className="mb-3" controlId="formProductDiscountPeriod">
                    <Form.Label column sm="2">할인 기간 :</Form.Label>
                    <Col sm="10">
                        <Row>
                            <Col xs={5}>
                                <Form.Control
                                    type="datetime-local"
                                    name="discountStartDate"
                                    value={product.discountStartDate}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col xs={2} className="text-center">
                                ~
                            </Col>
                            <Col xs={5}>
                                <Form.Control
                                    type="datetime-local"
                                    name="discountEndDate"
                                    value={product.discountEndDate}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Form.Group>

                {/* 상품 대표 이미지 */}
                <Form.Group as={Row} className="mb-3" controlId="formMainImage">
                    <Form.Label column sm="2">상품 대표 이미지 :</Form.Label>
                    <Col sm="10">
                        <div style={{ border: '1px dashed #ccc', padding: '20px', textAlign: 'center' }}>
                            {product.mainImage && (
                                <img
                                    src={URL.createObjectURL(product.mainImage)}
                                    alt="상품 대표 이미지"
                                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                                />
                            )}
                            <Form.Control
                                type="file"
                                name="mainImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-2"
                            />
                        </div>
                    </Col>
                </Form.Group>

                {/* 상품 상세 이미지 */}
                <Form.Group as={Row} className="mb-3" controlId="formDetailImages">
                    <Form.Label column sm="2">상품 상세 이미지 :</Form.Label>
                    <Col sm="10">
                        <div style={{ border: '1px dashed #ccc', padding: '20px', textAlign: 'center' }}>
                            <Row>
                                {product.detailImages.length > 0 &&
                                    product.detailImages.map((image, index) => (
                                        <Col key={index} xs={6} md={4} lg={3} className="mb-3">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`상세 이미지 ${index + 1}`}
                                                style={{ width: '100%', height: 'auto' }}
                                            />
                                        </Col>
                                    ))}
                            </Row>
                            <Form.Control
                                type="file"
                                name="detailImages"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="mt-2"
                            />
                        </div>
                    </Col>
                </Form.Group>

                {/* 버튼 그룹 */}
                <Row className="mt-4">
                    <Col className="text-center">
                        <Button variant="secondary" className="me-3">
                            메인으로 가기
                        </Button>
                        <Button variant="success" type="submit">
                            등록하기
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default SellerProductFormPage;