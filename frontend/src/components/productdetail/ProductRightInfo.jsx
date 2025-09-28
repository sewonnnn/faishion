import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Form,
    InputGroup,
    Col,
    Card
} from "react-bootstrap";
import { FaHeart, FaTimes } from 'react-icons/fa';
import "../../pages/ProductDetailPage.css"
import {useAuth} from "../../contexts/AuthContext.jsx";

const ProductRightInfo = ({ productId, product }) => {
    const navigate = useNavigate();
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [availableSizes, setAvailableSizes] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const {api} = useAuth();
    useEffect(() => {
        if (product && product.stockByColorAndSize) {
            const colors = Object.keys(product.stockByColorAndSize);
            if (colors.length > 0) {
                setSelectedColor("");
            }
        }
    }, [product]);

    useEffect(() => {
        if (selectedColor && product && product.stockByColorAndSize[selectedColor]) {
            const sizesForColor = Object.keys(product.stockByColorAndSize[selectedColor]);
            setAvailableSizes(sizesForColor);
            setSelectedSize("");
        }
    }, [selectedColor, product]);

    const handleAddOption = (color, size) => {
        if (color && size) {
            const existingOption = selectedOptions.find(
                (option) => option.color === color && option.size === size
            );

            // 재고 수량 확인
            const stockQuantity = product.stockByColorAndSize[color][size] || 0;

            if (existingOption) {
                // 이미 선택된 상품이면, 재고 확인 후 수량 증가
                if (existingOption.quantity < stockQuantity) {
                    const updatedOptions = selectedOptions.map(option =>
                        option.color === color && option.size === size
                            ? { ...option, quantity: option.quantity + 1 }
                            : option
                    );
                    setSelectedOptions(updatedOptions);
                } else {
                    alert("재고가 부족합니다.");
                }
            } else {
                // 새로운 조합이면 목록에 추가
                if (stockQuantity > 0) {
                    setSelectedOptions([...selectedOptions, {
                        color: color,
                        size: size,
                        quantity: 1,
                        price: product.price,
                        stockQuantity: stockQuantity
                    }]);
                } else {
                    alert("선택하신 상품은 재고가 없습니다.");
                }
            }

            setSelectedColor("");
            setSelectedSize("");
        }
    };

    const handleQuantityChange = (index, delta) => {
        const updatedOptions = [...selectedOptions];
        const currentQuantity = updatedOptions[index].quantity;
        const stockQuantity = updatedOptions[index].stockQuantity;
        const newQuantity = currentQuantity + delta;

        if (newQuantity > 0 && newQuantity <= stockQuantity) {
            updatedOptions[index].quantity = newQuantity;
            setSelectedOptions(updatedOptions);
        } else if (newQuantity > stockQuantity) {
            alert("재고 수량을 초과할 수 없습니다.");
        }
    };

    const handleRemoveOption = (index) => {
        const updatedOptions = selectedOptions.filter((_, i) => i !== index);
        setSelectedOptions(updatedOptions);
    };

    const onAIForm = () => {
        navigate(`/gemini/${productId}`);
    };

    // 바로가기 클릭 시 주문서 이동
    const onOrderForm = async () => {
        if (selectedOptions.length === 0) {
            alert("상품 옵션을 선택해 주세요.");
            return;
        }

        const requestBody = {
            productId: productId, // 상품 ID (DirectOrderRequestDTO.productId)
            items: selectedOptions.map(opt => ({ // OrderItemRequestDTO 리스트
                color: opt.color,
                size: opt.size,
                quantity: opt.quantity
            }))
        };

        try {
            const response = await api.post('/order/newdirect', requestBody);

            // ⭐️ 2. 응답으로 받은 주문 상품 목록(CartProductDTO 리스트)을 'directItems' 키로 전달
            navigate(`/order/new`, {
                state: {
                    directItems: response.data // ⭐️ 키 이름을 명확히 변경
                }
            });

        } catch (error) {
            console.error('바로 구매 데이터 준비 실패:', error.response?.data || error.message);
            alert("바로 구매를 위한 데이터를 불러오는 데 실패했습니다.");
        }
    };

    const onCartSave = async () => {
        if (selectedOptions.length === 0) {
            alert("상품 옵션을 선택해 주세요.");
            return;
        }

        const isValid = selectedOptions.every(option =>
            option.color && option.size && option.quantity > 0
        );

        if (!isValid) {
            alert("모든 상품의 색상, 사이즈, 수량을 올바르게 선택했는지 확인해 주세요.");
            return;
        }
        try {
            const stockList = selectedOptions.map(option => ({
                quantity: option.quantity,
                color: option.color,
                size: option.size,
                productId: productId
            }));

            const response = await api.post('/cart/save', stockList);
            if (response) {
                alert("카트 상품이 담겼습니다.");
                setSelectedOptions([]);
            }
        } catch (error) {
            console.error('Error fetching banner data:', error);
        }
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined || isNaN(price)) {
            return "0";
        }
        return price.toLocaleString("ko-KR");
    };

    const onWishSave = async () => {
        try {
            const response = await api.post(`/wish/save/${productId}`);
            alert(response.data);
        } catch (error) {
            console.error('Error fetching banner data:', error);
        }
    };

    const totalQuantity = selectedOptions.reduce((sum, option) => sum + option.quantity, 0);
    const totalPrice = selectedOptions.reduce((sum, option) => sum + (option.price * option.quantity), 0);

    const currentProduct = product;
    if (!currentProduct) {
        return <div>상품 정보를 로드 중입니다...</div>;
    }

    const isDiscounting = currentProduct.originalPrice > currentProduct.price;

    return (
        <div className="ProductRightInfo">
            {/* 상품 정보 영역 (기존 코드 유지) */}
            <div className="product-header mb-4">
                <p className="brand-name">
                    <strong>{currentProduct.brand}</strong>
                </p>
                <h3 className="product-name">
                    {currentProduct.name}
                </h3>
            </div>
            {/* 가격 및 할인 영역 (기존 코드 유지) */}
            <div className="price-info mb-4">
                {isDiscounting ? (
                    <>
                        <div className="d-flex align-items-center mb-1">
                            <h4 className="fw-bold me-2" style={{ color: 'red' }}>
                                {currentProduct.discountRate}%
                            </h4>
                            <p className="text-decoration-line-through text-muted mb-0">
                                {formatPrice(currentProduct.originalPrice)}원
                            </p>
                        </div>
                        <h3 className="final-price">
                            {formatPrice(currentProduct.price)}원
                        </h3>
                    </>
                ) : (
                    <h3 className="final-price">
                        {formatPrice(currentProduct.price)}원
                    </h3>
                )}
            </div>
            <Col className="text-end">
                <Button variant="outline-dark" onClick={onAIForm}>
                    AI로 옷 입어보기
                </Button>
            </Col>
            <hr />

            {/* 색상 선택 셀렉트 박스 */}
            <div className="mb-3">
                <p className="fw-bold">색상</p>
                <Form.Select
                    aria-label="색상 선택"
                    value={selectedColor}
                    onChange={(e) => {
                        setSelectedColor(e.target.value);
                        setSelectedSize("");
                    }}
                >
                    <option value="">색상 선택</option>
                    {product.stockByColorAndSize && Object.keys(product.stockByColorAndSize).map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </Form.Select>
            </div>

            <div className="mb-3">
                <p className="fw-bold">사이즈</p>
                <Form.Select
                    aria-label="사이즈 선택"
                    value={selectedSize}
                    onChange={(e) => {
                        const newSize = e.target.value;
                        setSelectedSize(newSize);
                        if (selectedColor && newSize) {
                            handleAddOption(selectedColor, newSize);
                            setSelectedColor("");
                            setSelectedSize("");
                        }
                    }}
                    disabled={!selectedColor}
                >
                    <option value="">사이즈 선택</option>
                    {availableSizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </Form.Select>
            </div>

            <hr />

            {/* 선택된 상품 목록 표시 영역 */}
            <div className="selected-items-container">
                {selectedOptions.map((option, index) => (
                    <Card key={index} className="mb-2 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <div>
                                    <strong>{option.color} · {option.size}</strong>
                                </div>
                            </div>
                            <Button variant="light" size="sm" onClick={() => handleRemoveOption(index)}>
                                <FaTimes />
                            </Button>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-2">
                            <InputGroup style={{ width: '120px' }}>
                                <Button variant="outline-secondary" onClick={() => handleQuantityChange(index, -1)}>-</Button>
                                <Form.Control
                                    aria-label="Quantity"
                                    value={option.quantity}
                                    className="text-center"
                                />
                                <Button variant="outline-secondary" onClick={() => handleQuantityChange(index, 1)}>+</Button>
                            </InputGroup>
                            <div className="text-end">
                                <small className="text-muted">재고: {option.stockQuantity}개</small>
                                <h5 className="mb-0 fw-bold">
                                    {formatPrice(option.price * option.quantity)}원
                                </h5>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {selectedOptions.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3 p-3 border-top border-bottom">
                    <h5 className="mb-0">총 {totalQuantity}개</h5>
                    <h4 className="mb-0 fw-bold">{formatPrice(totalPrice)}원</h4>
                </div>
            )}

            {/* 버튼 영역 (기존 코드 유지) */}
            <div className="d-grid gap-2 mt-4">
                <div className="d-flex align-items-center">
                    <div className="col-2">
                        <Button variant="light" size="lg" onClick={onWishSave} className="w-100 me-2">
                            <FaHeart color="dark" />
                        </Button>
                    </div>
                    <div className="col-10">
                        <Button variant="dark" size="lg" onClick={onCartSave} className="w-100">
                            장바구니
                        </Button>
                    </div>
                </div>
                <Button variant="primary" size="lg" onClick={onOrderForm}>바로 구매</Button>
            </div>
        </div>
    );
};

export default ProductRightInfo;