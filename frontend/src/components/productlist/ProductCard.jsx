import React from "react";
import { Card } from 'react-bootstrap';
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

    // 상품 선택시 상품 상세로 이동 (기능 유지)
    const productClick = () => {
        nav(`/product/${productId}`);
    };

    return (
        <Card className="product-card h-100 border-0" onClick={productClick}>
            {/* 상품 이미지 */}
            <div className="card-img-wrapper">
                {/* imageUrl이 없을 경우 대체 이미지를 고려할 수 있으나, 현재는 받은 코드를 기반으로 유지 */}
                <Card.Img variant="top" src={imageUrl} alt={name} />

                {/* 뱃지 컨테이너: isNew, isSale, isBest 모두 여기에 표시됩니다. */}
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
                {/* 부트스트랩 mb-1은 margin-bottom: 0.25rem */}
                <Card.Title className="product-brand mb-1">{brandName}</Card.Title>
                <Card.Text className="product-name mb-1">{name}</Card.Text>

                {/* 가격 정보: 디자인 이미지와 같이 "할인율 최종가격 원래가격(취소선)" 순서로 배치 */}
                <div className="price-info d-flex align-items-center mb-1">

                    {/* 1. 할인율 (빨간색, 굵게) */}
                    {discountRate && discountRate > 0 && (
                        // discountRate가 숫자이거나 유효한 값이면 표시
                        <span className="discount-rate">{discountRate}%</span>
                    )}

                    {/* 2. 최종 가격 (굵게, 검정) */}
                    <span className="final-price">{finalPrice}원</span>

                    {/* 3. 원래 가격 (취소선, 회색) */}
                    {/* finalPrice와 originalPrice가 다를 때만 originalPrice 표시 */}
                    {originalPrice && (
                        <span className="original-price text-muted">{originalPrice}</span>
                    )}
                </div>

                {/* 리뷰 정보 */}
                <div className="d-flex align-items-center mb-1">
                    <span className="rating-info text-muted">
                        <BsStarFill className="star-icon me-1" />
                        {/* reviewRating이 유효하면 소수점 첫째 자리까지, 아니면 '0.0' 표시 */}
                        {reviewRating ? reviewRating.toFixed(1) : '0.0'}점 ({reviewCount || 0})
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;