import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import React from "react";
import {useAuth} from "../../contexts/AuthContext.jsx";
import { useState, useEffect } from 'react';

function SellerReportModal({show, setShow, item}) {
    const [reason, setReason] = React.useState(null);
    const [description, setDescription] = React.useState(null);
    const handleClose = () => setShow(false);
    const [productId, setProductId] = useState(null);
    const {api} = useAuth();
    // 신고 저장 버튼 핸들러

    useEffect(()=>{
        if(show && item){
            setProductId(item.productId);
                }

        },[show,item]);


    const handleReport = async () => {

        if(!productId){
            alert("신고 대상 상품 정보가 없습니다.");
            return;
            }
        try {
            const result = {
                productId,
                reason : reason,
                description : description
            }
            // 비동기 요청을 기다림
            const response = await api.post("/seller/report/save",result);
            alert("신고가 접수 되었습니다.");
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
                                <option value="허위광고">허위광고</option>
                                <option value="고객 응대 불만">고객 응대 불만</option>
                                <option value="배송 불량">배송 불량</option>
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
                    <Button variant="primary" onClick={()=>handleReport()}>
                        저장하기
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default SellerReportModal;