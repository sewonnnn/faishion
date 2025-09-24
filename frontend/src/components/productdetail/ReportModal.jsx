import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import React from "react";
import {useAuth} from "../../contexts/AuthContext.jsx";

function ReportModal({show, setShow, reviewId}) {
    const [reason, setReason] = React.useState(null);
    const [description, setDescription] = React.useState(null);
    const handleClose = () => setShow(false);
    const {api} = useAuth();
    // 신고 저장 버튼 핸들러
    const handleReport = async (reviewId) => {

        try {
            const result = {
                reviewId : reviewId,
                reason : reason,
                description : description
            }
            // 비동기 요청을 기다림
            const response = await api.post("/report/isReported",result);
            alert(response.data);
            handleClose();
        } catch (error) {
            // 네트워크 오류, 서버 오류 등 예외 처리
            console.error("신고 중 오류 발생:", error);
            alert("신고 처리 중 오류가 발생했습니다.");
        }
    };


    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>리뷰 신고하기</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>신고 사유</Form.Label>
                            <Form.Select aria-label="Default select example" onChange={(e)=> setReason(e.currentTarget.value)}>
                                <option>신고 사유를 선택하세요</option>
                                <option value="욕설">욕설</option>
                                <option value="스팸 및 부적절한 홍보">스팸 및 부적절한 홍보</option>
                                <option value="음란물">음란물</option>
                                <option value="기타">기타</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlTextarea1"
                        >
                            <Form.Label>신고내용</Form.Label>
                            <Form.Control as="textarea" rows={3} onChange={(e) => setDescription(e.target.value)}/>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        닫기
                    </Button>
                    <Button variant="primary" onClick={()=>handleReport(reviewId)}>
                        저장하기
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ReportModal;