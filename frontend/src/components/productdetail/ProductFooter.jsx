import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Form, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';
// import './ProductFooter.css';

// API URL을 상수로 정의
const REVIEW_API_URL = '/review';

const ProductFooter = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');

    // 리뷰 목록을 백엔드에서 불러오는 함수
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/api/review/${productId}`);
            setReviews(response.data);
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

    // 새 리뷰를 백엔드에 등록하는 함수
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (newReview.trim() === '') {
            alert('내용을 입력해주세요.');
            return;
        }

        // 백엔드 ReviewDto에 맞게 데이터 객체 구성
        const reviewData = {
            productId,
            content: newReview,
            // 다른 필요한 데이터 추가
        };

        try {
            const response = await axios.post("/api/review/save", reviewData);
            if (response.status === 201 || response.status === 200) {
                alert('리뷰가 성공적으로 등록되었습니다.');
                setNewReview('');
                fetchReviews(); // 등록 성공 후 목록 새로고침
            }
        } catch (error) {
            console.error('리뷰 등록에 실패했습니다:', error.response ? response.data : error);
            alert('리뷰 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    return (
        <Container fluid className="ProductFooter mt-5">
            <Tabs defaultActiveKey="review" id="product-tabs" className="mb-3">
                <Tab eventKey="review" title={`상품 리뷰 (${reviews.length})`}>
                    <div className="tab-content-area">
                        <Form onSubmit={handleReviewSubmit} className="mb-4">
                            <Form.Group className="mb-3" controlId="reviewForm">
                                <Form.Label>리뷰 작성</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="상품에 대한 솔직한 리뷰를 작성해주세요."
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                />
                            </Form.Group>
                            <div className="d-grid">
                                <Button variant="primary" type="submit">
                                    리뷰 등록
                                </Button>
                            </div>
                        </Form>

                        <hr />

                        {reviews.length > 0 ? (
                            <ListGroup variant="flush">
                                {reviews.map((review) => (
                                    <ListGroup.Item key={review.id} className="review-item">
                                        <div className="d-flex justify-content-between">
                                            <strong className="review-author">{review.user.name}</strong>
                                            <small className="text-muted">{new Date(review.createdAt).toLocaleDateString('ko-KR')}</small>
                                        </div>
                                        <p className="review-content mt-2 mb-0">{review.content}</p>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <p className="text-center text-muted">아직 작성된 리뷰가 없습니다.</p>
                        )}
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