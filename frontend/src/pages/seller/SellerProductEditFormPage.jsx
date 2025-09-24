import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CategorySelector from "../../components/seller/productform/CategorySelector.jsx";
import MultipleImageEditor from "../../components/seller/producteditform/MultipleImageEditor.jsx";
import MultipleStockImageEditor from "../../components/seller/producteditform/MultipleStockImageEditor.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const SellerProductEditFormPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product: initialProduct } = location.state || {};

    // Redirect if no product data is passed
    useEffect(() => {
        if (!initialProduct) {
            alert('상품 정보가 없습니다. 메인 페이지로 돌아갑니다.');
            navigate('/seller/dashboard');
        }
    }, [initialProduct, navigate]);


    const [product, setProduct] = useState({
        name: initialProduct?.name || '',
        status: initialProduct?.status || 1,
        description: initialProduct?.description || '',
        price: initialProduct?.price || '',
        category: initialProduct?.category || null,
        discountPrice: initialProduct?.discountPrice || '',
        discountStartDate: initialProduct?.discountStartDate || '',
        discountEndDate: initialProduct?.discountEndDate || '',
        mainImages: initialProduct?.mainImageList || [],
        detailImages: initialProduct?.detailImageList || [],
        stocks: initialProduct?.stockList || [],
    });

    const [categoryGroups, setCategoryGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(initialProduct?.category.categoryGroup.id || '');
    const [selectedCategory, setSelectedCategory] = useState(initialProduct?.category?.id || '');
    const { api } = useAuth();

    // State to track removed image URLs
    const [removedMainImageUrls, setRemovedMainImageUrls] = useState([]);
    const [removedDetailImageUrls, setRemovedDetailImageUrls] = useState([]);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategoryGroups = async () => {
            try {
                const response = await api.get('/category/groups');
                setCategoryGroups(response.data);
            } catch (error) {
                console.error("Error fetching category groups:", error);
            }
        };
        fetchCategoryGroups();
    }, [api]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'discountPrice') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setProduct((prevProduct) => ({ ...prevProduct, [name]: numericValue }));
        } else if (name === 'status') {
            setProduct((prevProduct) => ({ ...prevProduct, status: parseInt(value, 10) }));
        } else {
            setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
        }
    };

    const handlePriceBlur = (e) => {
        const { name } = e.target;
        const price = Number(product.price);
        const discountPrice = Number(product.discountPrice);
        if (name === 'price' && discountPrice > price) {
            setProduct((prevProduct) => ({ ...prevProduct, discountPrice: '' }));
            alert('할인 금액은 상품 가격보다 클 수 없습니다. 할인 금액이 초기화됩니다.');
        }
    };

    const handleDiscountPriceBlur = (e) => {
        const price = Number(product.price);
        const discountPrice = Number(e.target.value);
        if (discountPrice > price) {
            setProduct((prevProduct) => ({ ...prevProduct, discountPrice: '' }));
            alert('할인 금액은 상품 가격보다 클 수 없습니다.');
        }
    };

    const handleCategoryGroupChange = (e) => {
        const groupId = e.target.value;
        setSelectedGroup(groupId);
        setSelectedCategory('');
        setProduct((prevProduct) => ({ ...prevProduct, category: null }));
    };

    const handleSubCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
        setProduct((prevProduct) => ({ ...prevProduct, category: { id: categoryId } }));
    };

    const handleMainImageChange = (e) => {
        const files = Array.from(e.target.files);
        setProduct((prevProduct) => ({ ...prevProduct, mainImages: [...prevProduct.mainImages, ...files] }));
    };

    const handleRemoveMainImage = (index) => {
        const imageToRemove = product.mainImages[index];
        if (typeof imageToRemove === 'string') {
            setRemovedMainImageUrls((prev) => [...prev, imageToRemove]);
        }
        setProduct((prevProduct) => ({ ...prevProduct, mainImages: prevProduct.mainImages.filter((_, i) => i !== index) }));
    };

    // New handler for editing/replacing a main image
    const handleEditMainImage = (index, file) => {
        const oldImage = product.mainImages[index];
        if (typeof oldImage === 'string') {
            setRemovedMainImageUrls((prev) => [...prev, oldImage]);
        }
        setProduct((prevProduct) => {
            const newImages = [...prevProduct.mainImages];
            newImages[index] = file;
            return { ...prevProduct, mainImages: newImages };
        });
    };

    const handleDetailImageChange = (e) => {
        const files = Array.from(e.target.files);
        setProduct((prevProduct) => ({ ...prevProduct, detailImages: [...prevProduct.detailImages, ...files] }));
    };

    const handleRemoveDetailImage = (index) => {
        const imageToRemove = product.detailImages[index];
        if (typeof imageToRemove === 'string') {
            setRemovedDetailImageUrls((prev) => [...prev, imageToRemove]);
        }
        setProduct((prevProduct) => ({ ...prevProduct, detailImages: prevProduct.detailImages.filter((_, i) => i !== index) }));
    };

    // New handler for editing/replacing a detail image
    const handleEditDetailImage = (index, file) => {
        const oldImage = product.detailImages[index];
        if (typeof oldImage === 'string') {
            setRemovedDetailImageUrls((prev) => [...prev, oldImage]);
        }
        setProduct((prevProduct) => {
            const newImages = [...prevProduct.detailImages];
            newImages[index] = file;
            return { ...prevProduct, detailImages: newImages };
        });
    };

    const handleAddStockImage = (e) => {
        const files = Array.from(e.target.files);
        const newStocks = files.map(file => ({
            image: file,
            quantity: 0,
            color: '',
            size: '',
            isNew: true
        }));
        setProduct((prevProduct) => ({ ...prevProduct, stocks: [...prevProduct.stocks, ...newStocks] }));
    };

    const handleRemoveStockImage = (index) => {
        setProduct((prevProduct) => ({ ...prevProduct, stocks: prevProduct.stocks.filter((_, i) => i !== index) }));
    };

    const handleUpdateStockItem = (index, key, value) => {
        setProduct((prevProduct) => ({
            ...prevProduct,
            stocks: prevProduct.stocks.map((stock, i) =>
                i === index ? { ...stock, [key]: value } : stock
            ),
        }));
    };

    // New handler for editing/replacing a stock image
    const handleEditStockImage = (index, file) => {
        setProduct((prevProduct) => {
            const newStocks = [...prevProduct.stocks];
            newStocks[index] = {
                ...newStocks[index],
                image: file,
                // Mark as new to ensure it's sent as a new file, even if it was originally an existing image
                isNew: true
            };
            return { ...prevProduct, stocks: newStocks };
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const price = Number(product.price);
        const discountPrice = Number(product.discountPrice);
        const { discountStartDate, discountEndDate, stocks, category } = product;

        if (!category) {
            alert('상품 카테고리를 선택해야 합니다.');
            return;
        }

        if (product.mainImages.length === 0) {
            alert('상품 대표 이미지를 1개 이상 등록해야 합니다.');
            return;
        }

        if (product.detailImages.length === 0) {
            alert('상품 상세 이미지를 1개 이상 등록해야 합니다.');
            return;
        }

        if (product.stocks.length === 0) {
            alert('상품 재고 이미지를 1개 이상 등록해야 합니다.');
            return;
        }

        if (discountPrice > 0) {
            if (!discountStartDate || !discountEndDate) {
                alert('할인 금액이 있을 경우 할인 기간을 모두 입력해야 합니다.');
                return;
            }
            const startDate = new Date(discountStartDate);
            const endDate = new Date(discountEndDate);
            if (endDate <= startDate) {
                alert('할인 종료일은 시작일 이후여야 합니다.');
                return;
            }
        }

        if (discountPrice > price) {
            alert('할인 금액은 상품 가격보다 클 수 없습니다. 상품 정보를 다시 확인해주세요.');
            return;
        }

        for (const stock of stocks) {
            if (stock.color.trim() === '' || stock.size.trim() === '') {
                alert('모든 재고에 대한 색상과 사이즈를 입력해야 합니다.');
                return;
            }
        }

        const formData = new FormData();

        const newMainImages = product.mainImages.filter(file => file instanceof File);
        const existingMainImageUrls = product.mainImages.filter(file => typeof file === 'string');

        const newDetailImages = product.detailImages.filter(file => file instanceof File);
        const existingDetailImageUrls = product.detailImages.filter(file => typeof file === 'string');

        const newStocks = product.stocks.filter(stock => stock.isNew);
        const existingStocks = product.stocks.filter(stock => !stock.isNew);

        const newStockImages = newStocks.map(stock => stock.image);

        const updatedProductData = {
            id: initialProduct.id,
            name: product.name,
            status: product.status,
            description: product.description,
            price: product.price,
            category: product.category,
            discountPrice: product.discountPrice,
            discountStartDate: product.discountStartDate,
            discountEndDate: product.discountEndDate,
            // Pass the existing URLs and the ones to be removed
            mainImageUrls: existingMainImageUrls,
            detailImageUrls: existingDetailImageUrls,
            removedMainImageUrls: removedMainImageUrls,
            removedDetailImageUrls: removedDetailImageUrls,
        };

        const updatedStockData = existingStocks.map(stock => ({
            id: stock.id,
            quantity: stock.quantity,
            color: stock.color,
            size: stock.size,
        }));

        const newStockData = newStocks.map(stock => ({
            quantity: stock.quantity, // Note: changed from stock.count
            color: stock.color,
            size: stock.size,
        }));

        formData.append('product', new Blob([JSON.stringify(updatedProductData)], { type: 'application/json' }));
        formData.append('stockList', new Blob([JSON.stringify(updatedStockData)], { type: 'application/json' }));
        formData.append('newStockList', new Blob([JSON.stringify(newStockData)], { type: 'application/json' }));

        newMainImages.forEach((image) => {
            formData.append('newMainImages', image);
        });

        newDetailImages.forEach((image) => {
            formData.append('newDetailImages', image);
        });

        newStockImages.forEach((image) => {
            formData.append('newStockImages', image);
        });

        try {
            const response = await api.put(`/product/${initialProduct.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Product updated successfully:', response.data);
            alert('상품이 성공적으로 수정되었습니다.');
            navigate('/seller/dashboard');
        } catch (error) {
            console.error('Error updating product:', error.response ? error.response.data : error.message);
            alert('상품 수정 중 오류가 발생했습니다.');
        }
    };

    const showDiscountPeriod = product.discountPrice && Number(product.discountPrice) > 0;

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">상품 수정</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group as={Row} className="mb-3" controlId="formProductName">
                    <Form.Label column sm="2">상품명 :</Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            placeholder="상품명 입력"
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formProductDescription">
                    <Form.Label column sm="2">상품 설명 :</Form.Label>
                    <Col sm="10">
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={product.description}
                            onChange={handleChange}
                            placeholder="상품 설명 입력"
                            rows={5}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formProductStatus">
                    <Form.Label column sm="2">판매 상태 :</Form.Label>
                    <Col sm="10">
                        <Form.Select
                            name="status"
                            value={product.status}
                            onChange={handleChange}
                        >
                            <option value={1}>판매 게시</option>
                            <option value={0}>판매 중지</option>
                        </Form.Select>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formProductPrice">
                    <Form.Label column sm="2">상품 가격 :</Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            onBlur={handlePriceBlur}
                            placeholder="상품 가격 입력"
                            required
                        />
                    </Col>
                </Form.Group>

                <CategorySelector
                    categoryGroups={categoryGroups}
                    selectedGroup={selectedGroup}
                    selectedCategory={selectedCategory}
                    onGroupChange={handleCategoryGroupChange}
                    onCategoryChange={handleSubCategoryChange}
                />

                <Form.Group as={Row} className="mb-3" controlId="formProductDiscountPrice">
                    <Form.Label column sm="2">할인 금액 :</Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="number"
                            name="discountPrice"
                            value={product.discountPrice}
                            onChange={handleChange}
                            onBlur={handleDiscountPriceBlur}
                            placeholder="할인 금액 입력"
                        />
                    </Col>
                </Form.Group>

                {showDiscountPeriod && (
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
                )}

                <MultipleImageEditor
                    label="상품 대표 이미지"
                    images={product.mainImages}
                    onAddImage={handleMainImageChange}
                    onRemoveImage={handleRemoveMainImage}
                    onEditImage={handleEditMainImage}
                />

                <MultipleImageEditor
                    label="상품 상세 이미지"
                    images={product.detailImages}
                    onAddImage={handleDetailImageChange}
                    onRemoveImage={handleRemoveDetailImage}
                    onEditImage={handleEditDetailImage}
                />

                <MultipleStockImageEditor
                    label="상품 재고 이미지"
                    stocks={product.stocks}
                    onAddStockImage={handleAddStockImage}
                    onRemoveStockImage={handleRemoveStockImage}
                    onUpdateStockItem={handleUpdateStockItem}
                    onEditStockImage={handleEditStockImage}
                />

                <Row className="mt-4">
                    <Col className="text-center">
                        <Button variant="secondary" onClick={() => navigate('/seller/dashboard')} className="me-3">
                            취소
                        </Button>
                        <Button variant="success" type="submit">
                            수정하기
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default SellerProductEditFormPage;