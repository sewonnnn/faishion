import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ProductLiftInfo from "../components/productdetail/ProductLiftInfo.jsx";
import ProductRightInfo from "../components/productdetail/ProductRightInfo.jsx";
import { useParams } from "react-router-dom";
import ProductBody from "../components/productdetail/ProductBody.jsx";
import ProductFooter from "../components/productdetail/ProductFooter.jsx";
import axios from "axios";

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const findProduct = async () => {
            try {
                const response = await axios.get(`/api/product/${productId}`);
                setProductData(response.data); // DTO로 받은 데이터를 상태에 저장
            } catch (error) {
                console.error('Error fetching product data:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        findProduct();
    }, [productId]);

    // 로딩, 에러, 데이터 없음 상태를 처리하는 조건부 렌더링
    if (loading) {
        return <Container className="text-center my-5"><h2>로딩 중...</h2></Container>;
    }
    if (error || !productData) {
        return <Container className="text-center my-5 text-danger"><h2>상품 정보를 불러오지 못했습니다.</h2></Container>;
    }

    return (
        <Container className="my-5">
            <Row>
                <Col md={7}>
                    {/* DTO에 포함된 imageUrls를 ProductLiftInfo에 전달 */}
                    <ProductLiftInfo images={productData.imageUrls} />
                </Col>
                <Col md={5}>
                    {/* DTO 객체 전체를 ProductRightInfo에 전달 */}
                    <ProductRightInfo product={productData} productId={productId} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <ProductBody />
                </Col>
            </Row>
            <Row>
                <Col>
                    <ProductFooter productId={productId} />
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetailPage;