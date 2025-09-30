import React, { useState } from "react";
import { Card } from 'react-bootstrap';
import './ProductCard.css'; // 최신 CSS 파일 임포트
import { BsStarFill, BsHeartFill } from 'react-icons/bs';
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const nav = useNavigate();

    // 임의의 좋아요 수 (백엔드 데이터에 없으므로 시뮬레이션)
    // 사용자의 요청에 따라 기본값을 "좋아요수" 문자열로 변경했습니다.
    const [likeCount, setLikeCount] = useState(product.likeCount || 0);

    // Destructuring the product object
    const {
        productId,
        imageUrl,
        name,
        finalPrice,
        discountRate,
        originalPrice,
        brandName,
        reviewRating,
        reviewCount
    } = product;

    // 상품 선택시 상품 상세로 이동
    const productClick = () => {
        nav(`/product/${productId}`);
    };

    // 리뷰와 좋아요 정보 렌더링을 위한 함수
    const renderReviewAndLikeInfo = () => (

        <div className="rating-info-container">
            {/* 별점 */}
            <BsStarFill className="star-icon" />
            {reviewRating && (
                <span className="review-text">
                    {/* 4.5(115)와 같이 표시 */}
                    {reviewRating.toFixed(1)} ({reviewCount || 0})
                </span>
            )}

            {/* 좋아요 */}
            <BsHeartFill className="heart-icon" />
            <span className="like-count">{likeCount}</span>
        </div>
    );


    return (
        <Card className="product-card h-100 border-0" onClick={productClick}>
            {/* 상품 이미지 */}
            <div className="card-img-wrapper">
                <Card.Img variant="top" src={imageUrl} alt={name} />

                {/* 뱃지 컨테이너는 제거된 상태입니다. */}
            </div>

            {/* 상품 정보 */}
            <Card.Body className="p-0 pt-2">
                <Card.Title className="product-brand mb-1">{brandName}</Card.Title>
                <Card.Text className="product-name mb-1">{name}</Card.Text>

                {/* 가격 정보: 할인율 > 최종 가격 > 원가 순서로 배치 */}
                <div className="price-info d-flex align-items-center mb-1">

                    {/* 1. 할인율 */}
                    {discountRate && discountRate > 0 && (
                        <span className="discount-rate me-2">{discountRate}%</span>
                    )}

                    {/* 2. 최종 가격*/}
                    <span className="final-price fw-bold">{finalPrice}원</span>

                    {/* 3. 원래 가격 */}
                    {originalPrice && (
                        <span className="original-price text-muted">{originalPrice}원</span>
                    )}
                </div>
                {/* 리뷰 정보*/}
                {renderReviewAndLikeInfo()}

            </Card.Body>
        </Card>
    );
};

export default ProductCard;
