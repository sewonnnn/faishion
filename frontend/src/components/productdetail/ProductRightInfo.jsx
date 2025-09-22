// ProductRightInfo.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Button,
    Form,
    InputGroup,
    ToggleButton,
    ToggleButtonGroup,
    Col,
} from "react-bootstrap";
import { FaHeart } from 'react-icons/fa';
import "../../pages/ProductDetailPage.css"

const ProductRightInfo = ({ productId, product }) => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [color, setColor] = useState(null);
    const [size, setSize] = useState(null);
    const onAIForm = () => {
        navigate(`/gemini/${productId}`);
    };

    const onOrderForm = () => {
        navigate(`/order/new/${productId}`);
    };

    const onCountUp = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };

    const onCountDown = () => {
        if (quantity > 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };

    const onCartSave = async () => {
        try {
            const stock = {
                quantity: quantity,
                color: color,
                size: size,
                productId: productId
            }
            const response = await axios.post('/api/cart/save',stock);
            if(response){
                alert("카트 상품이 담겼습니다.");
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
        try{
            const response = await axios.post(`/api/wish/save/${productId}`);
            alert(response.data);

        }catch (error) {
            console.error('Error fetching banner data:', error);
        }
    }

    const currentProduct = product;
    if (!currentProduct) {
        return <div>상품 정보를 로드 중입니다...</div>;
    }

    // `isDiscounting` 변수로 할인이 적용 중인지 확인
    const isDiscounting = currentProduct.originalPrice > currentProduct.price;

    return (
        <div className="ProductRightInfo">
            {/* 상품 정보 영역 */}
            <div className="product-header mb-4">
                <p className="brand-name">
                    <strong>{currentProduct.brand}</strong>
                </p>
                <h3 className="product-name">
                    {currentProduct.name}
                </h3>
            </div>

            {/* 가격 및 할인 영역 */}
            <div className="price-info mb-4">
                {isDiscounting ? (
                    // 할인이 있는 경우
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
                    // 할인이 없는 경우 (최종 가격만 표시)
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

            {/* 색상 선택 영역 */}
            <div className="mb-3">
                <p className="fw-bold">색상</p>
                <ToggleButtonGroup
                    type="radio"
                    name="colors"
                    value={color}
                    onChange={(val) => setColor(val)}
                >
                    {/* 이미지 대신 <span> 태그 사용 */}
                    {currentProduct.colors && currentProduct.colors.map((c) => (
                        <ToggleButton
                            key={c}
                            id={`color-radio-${c}`}
                            value={c}
                            variant="outline-secondary"
                        >
                            <span>{c}</span>
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </div>

            {/* 사이즈 선택 영역 */}
            <div className="mb-3">
                <p className="fw-bold">사이즈</p>
                <ToggleButtonGroup
                    type="radio"
                    name="sizes"
                    value={size}
                    onChange={(val) => setSize(val)}
                >
                    {currentProduct.sizes && currentProduct.sizes.map((size) => (
                        <ToggleButton
                            key={size}
                            id={`size-radio-${size}`}
                            value={size}
                            variant="outline-secondary"
                        >
                            {size}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </div>

            {/* 수량 및 총액 영역 */}
            <div className="mb-3">
                <p className="fw-bold">수량</p>
                <div className="d-flex align-items-center justify-content-between">
                    <InputGroup style={{ width: '150px' }}>
                        <Button variant="outline-secondary" onClick={onCountDown}>-</Button>
                        <Form.Control
                            aria-label="Quantity"
                            value={quantity}
                            readOnly
                            className="text-center"
                        />
                        <Button variant="outline-secondary" onClick={onCountUp}>+</Button>
                    </InputGroup>
                    <h5 className="mb-0 fw-bold">
                        {formatPrice(currentProduct.price * quantity)}원
                    </h5>
                </div>
            </div>

            <hr />

            {/* 버튼 영역 */}
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