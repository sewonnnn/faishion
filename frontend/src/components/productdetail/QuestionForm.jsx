import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import {useAuth} from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom"; // useNavigate 추가

const showMessage = (message) => {
    console.log(message);
    alert(message);
};

const QuestionForm = ({ productId, onQuestionSubmitted }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSecret, setIsSecret] = useState(false);

    const {api, user} = useAuth();
    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            showMessage("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
            navigate('/login'); // 로그인 페이지 경로로 리다이렉션
            return;
        }

        try {
            const newQuestion = { productId, title, content, isSecret };
            await api.post('/qna/save', newQuestion);
            showMessage('문의가 성공적으로 등록되었습니다.');
            setTitle('');
            setContent('');
            setIsSecret(false);
            if (onQuestionSubmitted) {
                onQuestionSubmitted(); // 목록을 새로고침하기 위해 부모 컴포넌트의 함수 호출
            }
        } catch (error) {
            console.error('문의 등록에 실패했습니다:', error);
            // 서버 측에서 권한 에러(401)를 별도 처리하는 로직이 useAuth.api에 있다면
            // 이 alert은 다른 에러에 대해서만 발생할 수 있습니다.
            showMessage('문의 등록 중 오류가 발생했습니다.');
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4">
            <h5 className="mb-3">상품 문의 작성</h5>

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

            <Button
                variant="primary"
                type="submit"
                className="w-100"
            >
                문의하기
            </Button>
        </Form>
    );
};

export default QuestionForm;