import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Button,
    Form,
    InputGroup,
    ToggleButton,
    ToggleButtonGroup,
    Stack,
    Container,
    Row,
    Col,
    Card,
} from "react-bootstrap";
import "./ProductRightInfo.css";

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
                    console.log("카트에 저장 성공");
                }
            } catch (error) {
                console.error('Error fetching banner data:', error);
            }
    };

    const formatPrice = (price) => {
        return price.toLocaleString("ko-KR");
    };

    // mockProduct 객체를 명확하게 정의
    const mockProduct = {
        id: "123",
        brand: "BEAKER ORIGINAL",
        name: "Men Harry Cardigan - Brown",
        price: 337250,
        originalPrice: 355000,
        discountRate: "5%",
        colors: [
            { name: 'Brown', value: 'brown', image: '/images/brown_thumb.png' },
            { name: 'Navy', value: 'navy', image: '/images/navy_thumb.png' },
        ],
        sizes: ["S", "M", "L"],
    };

    const currentProduct = product || mockProduct;

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
                <div className="d-flex align-items-center mb-1">
                    <h4 className="fw-bold me-2" style={{ color: 'red' }}>
                        {currentProduct.discountRate}
                    </h4>
                    <p className="text-decoration-line-through text-muted mb-0">
                        {formatPrice(currentProduct.originalPrice)}
                    </p>
                </div>
                <h3 className="final-price">
                    {formatPrice(currentProduct.price)}원
                </h3>
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
                    {currentProduct.colors && currentProduct.colors.map((color) => (
                        <ToggleButton
                            key={color.value}
                            id={`color-radio-${color.value}`}
                            value={color.value}
                            variant="outline-secondary"
                        >
                            <img src={color.image} className="rounded-circle" style={{ width: '40px', height: '40px' }} alt={color.name} />
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
                <Button variant="dark" size="lg" onClick={onCartSave}>장바구니</Button>
                <Button variant="primary" size="lg" onClick={onOrderForm}>바로 구매</Button>
            </div>
        </div>
    );
};

export default ProductRightInfo;