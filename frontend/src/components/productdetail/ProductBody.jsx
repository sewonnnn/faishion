import React, {useEffect, useState} from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import "../../pages/ProductDetailPage.css"
import axios from "axios";
const ProductBody = ({productId}) => {
    const [imageUrl, setImageUrl] = useState([]);

    useEffect(() => {
        const findProduct = async () => {
            try {
                const response = await axios.get(`/api/product/body/${productId}`);
                setImageUrl(response.data); // DTO로 받은 데이터를 상태에 저장
            } catch (error) {
                console.error('Error fetching product data:', error);
            }
        };
        findProduct();
    }, [productId]);
    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    {/* 상품 상세 이미지 영역 */}
                    {imageUrl.map((img, index) => (
                        <div key={index} className="product-detail-image-wrapper mb-4">
                            <Image className="product-detail-body-image" src={img} fluid alt={`Product detail ${index + 1}`} />
                        </div>
                    ))}
                </Col>
            </Row>
        </Container>
    );
};

export default ProductBody;