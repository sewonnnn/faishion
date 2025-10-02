// ProductFooter.jsx
import React, { useState } from 'react';
import { Nav, Tab, Container, Row, Col, Button } from 'react-bootstrap'
import ReviewForm from "./ReviewForm.jsx";
import ReviewList from "./ReviewList.jsx";
import QuestionForm from "./QuestionForm.jsx";
import QuestionList from "./QuestionList.jsx";

const ProductFooter = ({ productId }) => {
    const [activeTab, setActiveTab] = useState('review');
    const [showQuestionForm, setShowQuestionForm] = useState(true);
    const [refreshQuestionList, setRefreshQuestionList] = useState(false);
    const [refreshReviewList, setRefreshReviewList] = useState(false);

    const handleQuestionSubmitted = () => {
        // 문의 작성 후 폼을 닫는 로직은 그대로 유지
        setShowQuestionForm(false);
        setRefreshQuestionList(prev => !prev);
    };

    return (
        <Container className="my-5">
            <Nav variant="tabs" defaultActiveKey="review" className="custom-tabs" onSelect={(selectedKey) => {
                setActiveTab(selectedKey);
                // 탭 전환 시 문의 폼 상태를 초기화.
                // Q&A 탭을 다시 선택하면 폼이 다시 나타남
                setShowQuestionForm(selectedKey === 'qna');
            }}>
                <Nav.Item>
                    <Nav.Link eventKey="review">상품 리뷰</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="qna">상품 문의</Nav.Link>
                </Nav.Item>
            </Nav>
            <Tab.Content className="mt-4">
                <Tab.Pane eventKey="review" active={activeTab === 'review'}>
                    <ReviewList productId={productId} key={refreshReviewList} />
                </Tab.Pane>
                <Tab.Pane eventKey="qna" active={activeTab === 'qna'}>
                    <QuestionForm
                        productId={productId}
                        onQuestionSubmitted={handleQuestionSubmitted}
                    />
                    <QuestionList productId={productId} key={refreshQuestionList} />
                </Tab.Pane>
            </Tab.Content>
        </Container>
    );
};

export default ProductFooter;