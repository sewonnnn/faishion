// QuestionList.jsx
import React, { useState, useEffect } from 'react';
import { ListGroup, Form, Button } from 'react-bootstrap';
import { BsLockFill, BsLock } from 'react-icons/bs';
import axios from 'axios';

const QuestionList = ({ productId }) => {
    const [questions, setQuestions] = useState([]);
    const [showSecret, setShowSecret] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // 백엔드 API에서 답변 정보를 함께 가져와야 합니다.
                const response = await axios.get(`/api/qna/product/${productId}`);
                setQuestions(response.data);
            } catch (error) {
                console.error('문의 목록을 불러오는 데 실패했습니다:', error);
            }
        };

        fetchQuestions();
    }, [productId]);

    // 비밀글 제외 여부에 따라 필터링
    const filteredQuestions = showSecret
        ? questions.filter(q => !q.isSecret)
        : questions;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check
                    type="checkbox"
                    label="비밀글 제외"
                    checked={showSecret}
                    onChange={(e) => setShowSecret(e.target.checked)}
                />
            </div>

            <ListGroup variant="flush">
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question) => (
                        <ListGroup.Item key={question.id}>
                            <div className="d-flex justify-content-between align-items-center">
                                <strong>{question.title}</strong>
                                <div>
                                    {question.isSecret ? <BsLockFill className="me-2" /> : <BsLock className="me-2" />}
                                    <small className="text-muted">{question.createdAt}</small>
                                </div>
                            </div>
                            <p className="mt-2 mb-0">
                                {question.isSecret ? "🔒 비밀글입니다." : question.content}
                            </p>
                            <small className="text-muted">
                                {question.answer ? "답변완료" : "답변 대기 중"} · {question.authorName} · {question.createdAt.split('T')[0]}
                            </small>
                        </ListGroup.Item>
                    ))
                ) : (
                    <p className="text-center text-muted">아직 작성된 문의가 없습니다.</p>
                )}
            </ListGroup>
        </div>
    );
};

export default QuestionList;