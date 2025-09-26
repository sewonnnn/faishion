import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import {useAuth} from "../../../contexts/AuthContext.jsx";

const SellerQnaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [qna, setQna] = useState(null);
    const [answerText, setAnswerText] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { api } = useAuth();

    useEffect(() => {
        const fetchQnaDetail = async () => {
            try {
                const response = await api.get(`/qna/${id}`);
                console.log(response.data);
                setQna(response.data);

                if (response.data.answer) {
                    setAnswerText(response.data.answer);
                }
            } catch (error) {
                console.error("문의사항을 불러오는 중 오류 발생:", error);
                setMessage("문의사항을 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchQnaDetail();
    }, [id, api]); // 'api'를 의존성 배열에 추가하여 린트 경고를 피합니다.

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        if (!answerText) {
            setMessage("답변 내용을 입력해주세요.");
            setIsSubmitting(false);
            return;
        }

        try {
            // URL과 메소드를 백엔드 API에 맞게 수정
            const response = await api.put(`/qna/answer/${id}`, {
                answer: answerText,
            });

            if (response.status === 200) {
                setMessage("답변이 성공적으로 등록되었습니다.");
                // 답변이 성공하면 Q&A 상세 정보 새로고침
                const updatedResponse = await api.get(`/qna/${id}`);
                setQna(updatedResponse.data);
            }
        } catch (error) {
            console.error("답변 등록 중 오류 발생:", error);
            const errorMessage = error.response?.data?.message || "답변 등록에 실패했습니다. 다시 시도해주세요.";
            setMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status" className="me-2" />
                <span className="text-muted">문의사항을 불러오는 중...</span>
            </Container>
        );
    }

    if (!qna) {
        return (
            <Container className="my-5">
                <Alert variant="danger">존재하지 않는 문의사항입니다.</Alert>
                <Button variant="secondary" onClick={() => navigate(-1)}>뒤로가기</Button>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center">문의사항 상세</h1>
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{qna.title}</h5>
                    <span className="text-muted small">
                        {new Date(qna.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                </Card.Header>
                <Card.Body>
                    {/* <Card.Text>를 제거하고 <div>로 감싸서 HTML 구조 오류 해결 */}
                    <div>
                        <p><strong>작성자:</strong> {qna.user_id}</p>
                        {qna.product && <p><strong>상품:</strong> {qna.productName}</p>}
                        <hr />
                        <strong>문의 내용:</strong>
                        <div dangerouslySetInnerHTML={{ __html: qna.content.replace(/\n/g, '<br />') }} className="p-3 border rounded bg-light mt-2" />
                    </div>
                </Card.Body>
            </Card>

            <Card className="mt-4 shadow-sm">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">답변</h5>
                </Card.Header>
                <Card.Body>
                    {qna.answer ? (
                        <>
                            <div className="p-3 border rounded bg-light mb-3">
                                <div dangerouslySetInnerHTML={{ __html: qna.answer.replace(/\n/g, '<br />') }} />
                            </div>
                            <small className="text-muted">
                                답변자: {qna.answeredBy?.businessName || "알 수 없음"}
                            </small>
                        </>
                    ) : (
                        <Form onSubmit={handleAnswerSubmit}>
                            <Form.Group controlId="answerContent" className="mb-3">
                                <Form.Label visuallyHidden>답변 내용</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    placeholder="답변 내용을 입력하세요..."
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <div className="d-flex justify-content-end">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <><Spinner as="span" animation="border" size="sm" /> 답변 등록 중...</> : "답변 등록"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>

            {message && <Alert variant={message.includes("성공") ? "success" : "danger"} className="mt-3">{message}</Alert>}

            <div className="text-center mt-4">
                <Button variant="secondary" onClick={() => navigate("/seller/qna/list")}>목록으로 돌아가기</Button>
            </div>
        </Container>
    );
};

export default SellerQnaDetail;