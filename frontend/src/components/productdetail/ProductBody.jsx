import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
//import './ProductBody.css';
import src from "../../assets/king.jpg";
const detailImages = [src, src, src, src, src]
const ProductBody = () => {
    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    {/* 상품 상세 이미지 영역 */}
                    {detailImages.map((img, index) => (
                        <div key={index} className="product-detail-image-wrapper mb-4">
                            <Image src={img} fluid alt={`Product detail ${index + 1}`} />
                        </div>
                    ))}
                </Col>
            </Row>
        </Container>
    );
};

export default ProductBody;