import React, { useEffect, useState } from "react";
import { Card, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductCard.css';
import { BsStarFill } from 'react-icons/bs';
import {useNavigate} from "react-router-dom"; // 별 아이콘 추가
import reactLogo from "../../assets/react.svg"; // 이미지 표시용

// 목 데이터 (Mock Data) 정의
const mockProductData = [
    {
        savedName: "https://image.wconcept.co.kr/productimg/image/img1/82/301772182.jpg",
        productId : 1,
        brandName: "COS",
        name: "오버사이즈 울 니트",
        discountRate: 20,
        finalPrice: 89000,
        originalPrice: 110000,
        hasCoupon: true,
        rating: 4.8,
        reviewCount: 150,
        isExclusive: true,
        isRecommend: false
    },
    {
        savedName: "https://image.wconcept.co.kr/productimg/image/img1/87/301732587.jpg",
        productId : 2,
        brandName: "ADER ERROR",
        name: "ZARA 콜라보 롱 슬리브",
        discountRate: 15,
        finalPrice: 65000,
        originalPrice: 77000,
        hasCoupon: false,
        rating: 4.5,
        reviewCount: 95,
        isExclusive: false,
        isRecommend: true
    },
    {
        savedName: "https://image.wconcept.co.kr/productimg/image/img1/81/301783881.jpg",
        productId : 3,
        brandName: "LEMAIRE",
        name: "크롭트 와이드 팬츠",
        discountRate: 0,
        finalPrice: 215000,
        originalPrice: 215000,
        hasCoupon: true,
        rating: 5.0,
        reviewCount: 30,
        isExclusive: false,
        isRecommend: false
    },
    {
        savedName: "https://image.wconcept.co.kr/productimg/image/img1/84/301772584.jpg",
        productId : 4,
        brandName: "TOTÊME",
        name: "토템 시그니처 셔츠",
        discountRate: 0,
        finalPrice: 150000,
        originalPrice: 150000,
        hasCoupon: false,
        rating: 4.7,
        reviewCount: 210,
        isExclusive: true,
        isRecommend: false
    },
    {
        savedName: "https://image.wconcept.co.kr/productimg/image/img1/80/301742480.jpg",
        productId : 5,
        brandName: "STONEHENGE",
        name: "스톤헨지 라운드 네클리스",
        discountRate: 10,
        finalPrice: 99000,
        originalPrice: 110000,
        hasCoupon: true,
        rating: 4.9,
        reviewCount: 120,
        isExclusive: false,
        isRecommend: true
    },
    {
        savedName: "https://image.wconcept.co.kr/productimg/image/img1/80/301742480.jpg",
        productId : 6,
        brandName: "STONEHENGE",
        name: "스톤헨지 라운드 네클리스",
        discountRate: 10,
        finalPrice: 99000,
        originalPrice: 110000,
        hasCoupon: true,
        rating: 4.9,
        reviewCount: 120,
        isExclusive: false,
        isRecommend: true
    },
];

const ProductCard = () => {
    const nav = useNavigate();
    const [productCard, setProductCard] = useState([]);

    useEffect(() => {
        // API 호출 대신 목 데이터를 사용하도록 수정
        setProductCard(mockProductData);
        // 실제 API 통신을 사용할 경우 아래 코드를 주석 해제
        // const fetchProductData = async () => {
        //     try {
        //         const response = await axios.get('/api/product/productcard');
        //         if (Array.isArray(response.data)) {
        //             setProductCard(response.data);
        //         } else {
        //             setProductCard([]);
        //         }
        //     } catch (error) {
        //         setProductCard([]);
        //     }
        // };
        // fetchProductData();
    }, []);

    if (productCard.length === 0) {
        return <p>상품 로딩 중...</p>;
    }

    const productclick = (productId) =>{
        nav(`/product/${productId}`);
    }
    return (
        <div className="product-card-container">
            <Row xs={2} md={4} lg={5} className="g-4">
                {productCard.map((item, index) => (
                    <Col key={index}>
                        <Card className="product-card h-100 border-0" onClick={()=> productclick(item.productId)}>
                            {/* 상품 이미지 */}
                            <div className="card-img-wrapper">
                                <Card.Img variant="top" src={reactLogo} alt={item.name} />
                                {item.isExclusive && <div className="exclusive-badge">단독</div>}
                                {item.isRecommend && <div className="recommend-badge">추천</div>}
                            </div>

                            {/* 상품 정보 */}
                            <Card.Body className="p-0 pt-2">
                                <Card.Title className="product-brand mb-1">{item.brandName}</Card.Title>
                                <Card.Text className="product-name mb-1">{item.name}</Card.Text>

                                {/* 가격 정보 */}
                                <div className="price-info d-flex align-items-center mb-1">
                                    {item.discountRate > 0 && (
                                        <span className="discount-rate me-2">{item.discountRate}%</span>
                                    )}
                                    <span className="final-price fw-bold">{item.finalPrice?.toLocaleString()}원</span>
                                    {item.originalPrice && item.discountRate > 0 && (
                                        <span className="original-price text-muted ms-auto">{item.originalPrice?.toLocaleString()}</span>
                                    )}
                                </div>

                                {/* 쿠폰, 리뷰 정보 등 */}
                                <div className="d-flex align-items-center mb-1">
                                    {item.hasCoupon && <div className="coupon-badge me-2">쿠폰</div>}
                                    {item.rating > 0 && (
                                        <span className="rating-info text-muted">
                                            {/* 별 아이콘 추가 */}
                                            <BsStarFill className="star-icon me-1" />
                                            {item.rating}점 ({item.reviewCount?.toLocaleString()})
                                        </span>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default ProductCard;