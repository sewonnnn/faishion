import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CategorySelector from "../../components/seller/productform/CategorySelector.jsx";
import MultipleImageUploader from "../../components/seller/productform/MultipleImageUploader.jsx";
import MultipleStockImageUploader from "../../components/seller/productform/MultipleStockImageUploader.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

const SellerProductFormPage = () => {
    const [product, setProduct] = useState({
        name: '',
        status: 1,
        description: '',
        price: '',
        category: null,
        discountPrice: '',
        discountStartDate: '',
        discountEndDate: '',
        mainImages: [],
        detailImages: [],
        stocks: [],
    });

    useEffect(()=>{
        console.log(product);
    }, [product]);

    const [categoryGroups, setCategoryGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const { api } = useAuth();

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
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'price' || name === 'discountPrice') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setProduct((prevProduct) => ({
                ...prevProduct,
                [name]: numericValue,
            }));
        } else if (name === 'status') {
            setProduct((prevProduct) => ({
                ...prevProduct,
                status: parseInt(value, 10),
            }));
        } else {
            setProduct((prevProduct) => ({
                ...prevProduct,
                [name]: value,
            }));
        }
    };

    const handlePriceBlur = (e) => {
        const { name } = e.target;
        const price = Number(product.price);
        const discountPrice = Number(product.discountPrice);

        if (name === 'price' && discountPrice > price) {
            setProduct((prevProduct) => ({
                ...prevProduct,
                discountPrice: '',
            }));
            alert('할인 금액은 상품 가격보다 클 수 없습니다. 할인 금액이 초기화됩니다.');
        }
    };

    const handleDiscountPriceBlur = (e) => {
        const price = Number(product.price);
        const discountPrice = Number(e.target.value);

        if (discountPrice > price) {
            setProduct((prevProduct) => ({
                ...prevProduct,
                discountPrice: '',
            }));
            alert('할인 금액은 상품 가격보다 클 수 없습니다.');
        }
    };

    const handleCategoryGroupChange = (e) => {
        const groupId = e.target.value;
        setSelectedGroup(groupId);
        setSelectedCategory('');
        setProduct((prevProduct) => ({
            ...prevProduct,
            category: null,
        }));
    };

    const handleSubCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
        setProduct((prevProduct) => ({
            ...prevProduct,
            category: { id: categoryId },
        }));
    };

    // New handler for updating main images
    const handleUpdateMainImage = (index, newFile) => {
        setProduct((prevProduct) => {
            const newMainImages = [...prevProduct.mainImages];
            newMainImages[index] = newFile;
            return {
                ...prevProduct,
                mainImages: newMainImages,
            };
        });
    };

    // New handler for updating detail images
    const handleUpdateDetailImage = (index, newFile) => {
        setProduct((prevProduct) => {
            const newDetailImages = [...prevProduct.detailImages];
            newDetailImages[index] = newFile;
            return {
                ...prevProduct,
                detailImages: newDetailImages,
            };
        });
    };

    // Existing handlers remain the same
    const handleMainImageChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            setProduct((prevProduct) => ({
                ...prevProduct,
                mainImages: [...prevProduct.mainImages, ...Array.from(files)],
            }));
        }
    };

    const handleRemoveMainImage = (index) => {
        setProduct((prevProduct) => ({
            ...prevProduct,
            mainImages: prevProduct.mainImages.filter((_, i) => i !== index),
        }));
    };

    const handleDetailImageChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            setProduct((prevProduct) => ({
                ...prevProduct,
                detailImages: [...prevProduct.detailImages, ...Array.from(files)],
            }));
        }
    };

    const handleRemoveDetailImage = (index) => {
        setProduct((prevProduct) => ({
            ...prevProduct,
            detailImages: prevProduct.detailImages.filter((_, i) => i !== index),
        }));
    };

    const handleAddStockImage = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            const newStock = Array.from(files).map(file => ({
                image: file,
                count: 0,
                color: '',
                size: '',
            }));
            setProduct((prevProduct) => ({
                ...prevProduct,
                stocks: [...prevProduct.stocks, ...newStock],
            }));
        }
    };

    const handleRemoveStockImage = (index) => {
        setProduct((prevProduct) => ({
            ...prevProduct,
            stocks: prevProduct.stocks.filter((_, i) => i !== index),
        }));
    };

    const handleUpdateStockItem = (index, key, value) => {
        setProduct((prevProduct) => ({
            ...prevProduct,
            stocks: prevProduct.stocks.map((stock, i) =>
                i === index ? { ...stock, [key]: value } : stock
            ),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const price = Number(product.price);
        const discountPrice = Number(product.discountPrice);
        const { discountStartDate, discountEndDate, stocks, category } = product;

        // Validation remains the same
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

        const productData = {
            name: product.name,
            status: product.status,
            description: product.description,
            price: product.price,
            category: product.category,
            discountPrice: product.discountPrice,
            discountStartDate: product.discountStartDate,
            discountEndDate: product.discountEndDate,
        };
        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

        product.mainImages.forEach((image) => {
            formData.append('mainImages', image);
        });

        product.detailImages.forEach((image) => {
            formData.append('detailImages', image);
        });

        const stockData = product.stocks.map(stock => ({
            quantity: stock.count,
            color: stock.color,
            size: stock.size,
        }));
        formData.append('stockList', new Blob([JSON.stringify(stockData)], { type: 'application/json' }));

        product.stocks.forEach((stock) => {
            formData.append('stockImages', stock.image);
        });

        try {
            const response = await api.post('/product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Product registered successfully:', response.data);
            alert('상품이 성공적으로 등록되었습니다.');
        } catch (error) {
            console.error('Error registering product:', error.response ? error.response.data : error.message);
            alert('상품 등록 중 오류가 발생했습니다.');
        }
    };

    const showDiscountPeriod = product.discountPrice && Number(product.discountPrice) > 0;

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">상품 등록</h2>
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

                <MultipleImageUploader
                    label="상품 대표 이미지"
                    images={product.mainImages}
                    onAddImage={handleMainImageChange}
                    onRemoveImage={handleRemoveMainImage}
                    onUpdateImage={handleUpdateMainImage} // New prop for updating
                />

                <MultipleImageUploader
                    label="상품 상세 이미지"
                    images={product.detailImages}
                    onAddImage={handleDetailImageChange}
                    onRemoveImage={handleRemoveDetailImage}
                    onUpdateImage={handleUpdateDetailImage} // New prop for updating
                />

                <MultipleStockImageUploader
                    label="상품 재고 이미지"
                    stocks={product.stocks}
                    onAddStockImage={handleAddStockImage}
                    onRemoveStockImage={handleRemoveStockImage}
                    onUpdateStockItem={handleUpdateStockItem}
                />

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