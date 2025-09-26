// QuestionForm.jsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import {useAuth} from "../../contexts/AuthContext.jsx";

const QuestionForm = ({ productId, onQuestionSubmitted }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSecret, setIsSecret] = useState(false);
    const {api} = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newQuestion = { productId, title, content, isSecret };
            await api.post('/qna/save', newQuestion);
            alert('문의가 성공적으로 등록되었습니다.');
            setTitle('');
            setContent('');
            setIsSecret(false);
            if (onQuestionSubmitted) {
                onQuestionSubmitted(); // 목록을 새로고침하기 위해 부모 컴포넌트의 함수 호출
            }
        } catch (error) {
            console.error('문의 등록에 실패했습니다:', error);
            alert('문의 등록 중 오류가 발생했습니다.');
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="제목을 입력하세요."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="상품에 대한 궁금한 점을 남겨주시면 빠르게 답변해드리겠습니다."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="비밀글 (판매자만 볼 수 있습니다)"
                    checked={isSecret}
                    onChange={(e) => setIsSecret(e.target.checked)}
                />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
                문의하기
            </Button>
        </Form>
    );
};

export default QuestionForm;