import React, { useState, useEffect } from 'react';
import { ListGroup, Form } from 'react-bootstrap';
import { BsLockFill } from 'react-icons/bs';
import { useAuth } from "../../contexts/AuthContext.jsx";

const QuestionList = ({ productId, onQuestionUpdate }) => {
    const [questions, setQuestions] = useState([]);
    const [showSecret, setShowSecret] = useState(false);
    const { api } = useAuth();

    const fetchQuestions = async () => {
        try {
            const response = await api.get(`/qna/product/${productId}`);
            console.log("문의내역"+response.data)
            setQuestions(response.data);
        } catch (error) {
            console.error('문의 목록을 불러오는 데 실패했습니다:', error);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [productId, onQuestionUpdate]);

    const filteredQuestions = questions.filter(question => {
        if (showSecret) {
            return !question.isSecret;
        }
        return true;
    });

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
                                <strong>
                                    {question.isSecret && !question.isMine
                                        ? "🔒 비밀글입니다"
                                        : question.title}
                                </strong>
                                <div>
                                    {question.isSecret ? <BsLockFill className="me-2" /> : null}
                                    <small className="text-muted">{question.createdAt}</small>
                                </div>
                            </div>
                            <p className="mt-2 mb-0">
                                {question.isSecret && !question.isMine
                                    ? "🔒 작성자만 열람할 수 있습니다."
                                    : question.content}
                            </p>
                            <small className="text-muted">
                                {question.answer ? "답변완료" : "답변 대기 중"} · {question.userName}
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