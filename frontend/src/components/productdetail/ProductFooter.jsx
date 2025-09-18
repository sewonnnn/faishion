import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Button } from 'react-bootstrap';
import axios from 'axios';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

// API URL을 상수로 정의
const REVIEW_API_URL = '/review';

const ProductFooter = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);

    // 리뷰 목록을 백엔드에서 불러오는 함수
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/api/review/${productId}`);
            setReviews(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('리뷰 목록을 불러오는 데 실패했습니다:', error);
            setReviews([]);
        }
    };

    // 컴포넌트 마운트 및 productId 변경 시 리뷰 목록 가져오기
    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    return (
        <Container fluid className="ProductFooter mt-5">
            <Tabs defaultActiveKey="review" id="product-tabs" className="mb-3">
                <Tab eventKey="review" title={`상품 리뷰 (${reviews.length})`}>
                    <div className="tab-content-area">
                        <Button
                            variant="primary"
                            onClick={() => setIsFormVisible(!isFormVisible)}
                            className="mb-4"
                        >
                            {isFormVisible ? '리뷰 작성 닫기' : '리뷰 작성'}
                        </Button>
                        {isFormVisible && (
                            <ReviewForm productId={productId} onReviewSubmitted={fetchReviews} />
                        )}

                        <hr />

                        <ReviewList reviews={reviews} />
                    </div>
                </Tab>

                <Tab eventKey="qna" title="상품 문의">
                    <div className="tab-content-area">
                        <h4>상품 문의 (5)</h4>
                        <p>궁금한 점이 있으신가요? 문의를 남겨주시면 빠르게 답변해 드리겠습니다.</p>
                        <Button variant="primary">문의하기</Button>
                    </div>
                </Tab>

                <Tab eventKey="shipping" title="배송/교환/반품 안내">
                    <div className="tab-content-area">
                        <h4>배송/교환/반품 정보</h4>
                        <p>
                            배송: 결제 완료 후 2~3일 내에 출고됩니다.<br />
                            교환/반품: 상품 수령 후 7일 이내에 신청 가능합니다.
                        </p>
                    </div>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default ProductFooter;
