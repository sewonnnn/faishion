import React, { useState } from "react";
import { Row, Col, Image } from "react-bootstrap";
import "../../pages/ProductDetailPage.css"

const ProductLiftInfo = ({ images }) => {
    // 메인 이미지 상태 관리
    const [mainImage, setMainImage] = useState(images[0]);

    return (
        <div className="ProductLiftInfo">
            <Row>
                {/* 썸네일 이미지 컬럼 */}
                <Col xs={2}
                     className="d-flex flex-column gap-2 hide-scrollbar"
                     style={{
                         maxHeight: '520px',
                         overflowY: 'auto'
                     }}>
                    {images.map((img, index) => (
                        <Image
                            key={index}
                            src={img}
                            alt={`Product thumbnail ${index + 1}`} // alt 속성 추가
                            thumbnail
                            className="p-1 cursor-pointer"
                            onClick={() => setMainImage(img)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </Col>
                {/* 메인 이미지 컬럼 */}
                <Col xs={10}>
                    <Image  className="product-left-main-img" src={mainImage} fluid alt="Main product image" /> {/* alt 속성 추가 */}
                </Col>
            </Row>
        </div>
    );
};

export default ProductLiftInfo;