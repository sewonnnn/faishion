// ProductDetail.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ProductLiftInfo from "../components/productdetail/ProductLiftInfo.jsx";
import ProductRightInfo from "../components/productdetail/ProductRightInfo.jsx";
import {useParams} from "react-router-dom";
import ProductBody from "../components/productdetail/ProductBody.jsx";
import ProductFooter from "../components/productdetail/ProductFooter.jsx";
const ProductDetail = () => {
    // 상품 정보를 가져오는 API 호출 로직 (mock data 사용)
    const {productId} = useParams();
    const productData = {
        id: "123",
        brand: "BEAKER ORIGINAL",
        name: "Men Harry Cardigan - Brown",
        price: 337250,
        originalPrice: 355000,
        discountRate: "5%",
        colors: [
            { name: 'Brown', value: 'brown', image: '../../assets/react.svg' },
            { name: 'Navy', value: 'navy', image: '../../assets/react.svg' },
        ],
        sizes: ["S", "M", "L"],
        images: [
            '../../assets/react.svg',
            '../../assets/react.svg',
            '../../assets/react.svg',
            '../../assets/react.svg',
        ],
    };

    return (
        <Container className="my-5">
            <Row>
                {/* 왼쪽: 상품 이미지 (8/12 = 2/3) */}
                <Col md={7}>
                    <ProductLiftInfo images={productData.images} />
                </Col>

                {/* 오른쪽: 상품 정보 (4/12 = 1/3) */}
                <Col md={5}>
                    <ProductRightInfo product={productData} productId={productId}/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ProductBody/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ProductFooter productId={productId}/>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetail;