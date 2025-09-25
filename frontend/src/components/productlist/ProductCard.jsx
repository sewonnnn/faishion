import React from "react";
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductCard.css';
import { BsStarFill } from 'react-icons/bs';
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const nav = useNavigate();

    // Destructuring the product object
    const {
        productId,
        imageUrl,
        name,
        finalPrice,
        discountRate,
        originalPrice,
        isNew,
        isSale,
        isBest,
        brandName,
        reviewRating,
        reviewCount
    } = product;

    // 상품 선택시 상품 상세로 이동
    const productClick = () => {
        nav(`/product/${productId}`);
    };

    return (
        <Card className="product-card h-100 border-0" onClick={productClick}>
            {/* 상품 이미지 */}
            <div className="card-img-wrapper">
                <Card.Img variant="top" src={imageUrl || reactLogo} alt={name} />

                {/* 뱃지 컨테이너: isNew, isSale, isBest 모두 여기에 표시됩니다. */}
                {/* 셋 중 하나라도 true이면 컨테이너를 렌더링합니다. */}
                {(isNew || isSale || isBest) && (
                    <div className="badge-overlay">
                        {isNew && <div className="badge-new me-1">신상품</div>}
                        {isSale && <div className="badge-sale me-1">할인중</div>}
                        {isBest && <div className="badge-best">추천</div>}
                    </div>
                )}
            </div>

            {/* 상품 정보 */}
            <Card.Body className="p-0 pt-2">
                <Card.Title className="product-brand mb-1">{brandName}</Card.Title>
                <Card.Text className="product-name mb-1">{name}</Card.Text>

                <div className="price-info d-flex align-items-center mb-1">
                    {discountRate && (
                        <span className="discount-rate me-2">{discountRate}%</span>
                    )}
                    <span className="final-price fw-bold">{finalPrice}원</span>
                    {originalPrice && (
                        <span className="original-price text-muted ms-auto">{originalPrice}</span>
                    )}
                </div>

                {/* 쿠폰, 리뷰 정보 등 */}
                <div className="d-flex align-items-center mb-1">
                    <span className="rating-info text-muted">
                        <BsStarFill className="star-icon me-1" />
                        {reviewRating ? reviewRating.toFixed(1) : '0.0'}점 ({reviewCount})
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;