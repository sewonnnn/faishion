import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Image as BootstrapImage, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import defaultImage from "../assets/user.jpg";
import 'bootstrap/dist/css/bootstrap.min.css';
import './OrderDetailPage.css';

// 금액을 쉼표 형식으로 포맷
const formatPrice = (price) => {
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    return validPrice.toLocaleString('ko-KR');
};

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const numericOrderId = Number(orderId);
    const nav = useNavigate();

    const [orderDetail, setOrderDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { api } = useAuth();

    const getImageUrl = (imageId) => {
        return imageId ? `${api.defaults.baseURL}/image/${imageId}` : defaultImage;
    };

    useEffect(() => {
        if (!orderId) {
            setError("주문 ID가 유효하지 않습니다.");
            setIsLoading(false);
            return;
        }

        const fetchOrderDetail = async () => {
            try {
                const response = await api.get(`/order/${numericOrderId}`);
                setOrderDetail(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching order detail:", err);
                const errorMessage = err.response && err.response.status === 403
                    ? "다른 사용자의 주문은 조회할 수 없습니다."
                    : "주문 상세 정보를 불러오는 데 실패했습니다.";
                setError(errorMessage);
                setOrderDetail(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId, api, numericOrderId]);

    if (isLoading) {
        return (
            <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Container className="my-5" style={{ maxWidth: '768px' }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!orderDetail) {
        return (
            <Container className="my-5" style={{ maxWidth: '768px' }}>
                <Alert variant="warning">주문 정보를 찾을 수 없습니다.</Alert>
            </Container>
        );
    }

    const receiverName = orderDetail.orderName || '수령인 정보 없음';
    const orderItems = orderDetail.orderItems || [];

    // 백엔드 상태를 한글로 변환하여 비교하기 위한 Map
    const statusMap = {
        'PENDING': '접수',
        'READY': '배송 준비',
        'SHIPPING': '발송',
        'DELIVERED': '배송 완료'
    };
    const currentKoreanStatus = statusMap[orderDetail.status] || '접수'; // 현재 상태
    const deliverySteps = ['접수', '발송', '배송 준비', '배송 완료'];
    const orderDate = orderDetail.orderDate ? new Date(orderDetail.orderDate).toLocaleDateString('ko-KR') : '날짜 정보 없음';


    return (
        <div className="bg-light min-vh-100 d-flex justify-content-center">
            <Container className="p-0 bg-white" style={{ maxWidth: '768px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)' }}>

                {/* 주문 상세 내역 */}
                <header className="py-3 px-3 border-bottom d-flex align-items-center">
                    <button onClick={() => nav(-1)} className="btn btn-link text-dark p-0 me-2" style={{ textDecoration: 'none' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <h1 className="fs-4 fw-bold mb-0">주문 상세 내역</h1>
                </header>

                <div className="p-3">

                    {/* 배송지 정보 섹션 */}
                    <section className="pb-3 border-bottom">
                        <p className="fw-bold mb-1">{receiverName}
                            <span className="badge bg-secondary ms-2" style={{ fontSize: '0.75rem' }}>기본 배송지</span>
                        </p>
                        <p className="mb-1">{orderDetail.street} {orderDetail.detail}</p>
                        <p className="mb-0">{orderDetail.zipcode}</p>
                    </section>

                    {/* 주문 상품 섹션 */}
                    <section className="py-3 border-bottom">
                        {orderItems.map((item) => (
                            <div key={item.id} className="d-flex align-items-start mb-3">
                                <BootstrapImage
                                    alt={item.productName}
                                    src={getImageUrl(item.productImageId)}
                                    className="me-3 rounded"
                                    style={{ width: '100px', height: '140px', objectFit: 'cover' }}
                                />
                                <div className="d-flex flex-column justify-content-center">
                                    <p className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>{item.sellerBusinessName}</p>
                                    <p className="fw-semibold mb-1" style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                                        {item.productName}
                                    </p>
                                    <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                        {item.productSize} / {item.quantity}개
                                    </p>
                                    {/* 원가와 할인가 */}
                                    <p className="text-muted text-decoration-line-through mb-0" style={{ fontSize: '0.8rem' }}>
                                        {formatPrice(item.productPrice)}원
                                    </p>
                                    <p className="fw-bold mb-0 text-danger" style={{ fontSize: '1.05rem' }}>
                                        {formatPrice(item.discountedProductPrice)}원
                                    </p>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* 배송 현황 섹션 (CSS 파일 적용) */}
                    <section className="py-3 border-bottom">
                        <h2 className="fs-5 fw-bold mb-4 text-start">배송 현황</h2>

                        <div className="d-flex justify-content-between align-items-center delivery-steps-container">

                            {deliverySteps.map((step, index) => {
                                // 현재 단계의 인덱스와 목표 단계의 인덱스를 비교하여 완료/활성 상태를 결정
                                const currentStepIndex = deliverySteps.indexOf(currentKoreanStatus);
                                const isCompleted = currentStepIndex >= index;

                                return (
                                    <div
                                        key={step}
                                        className={`delivery-step ${isCompleted ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                    >

                                        {/* 원형 아이콘 */}
                                        <div className="step-circle">
                                            {step}
                                        </div>

                                        {/* 연결선 (마지막 요소 제외) */}
                                        {index < deliverySteps.length - 1 && (
                                            <div
                                                className="step-line"
                                                // 완료된 단계의 라인에만 primary 색상 적용 (CSS에서 처리)
                                                style={{ backgroundColor: isCompleted ? '#0d6efd' : '#e0e0e0' }}
                                            ></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/*  총 결제 정보 섹션 */}
                    <section className="py-3">
                        <p className="d-flex justify-content-between mb-1">
                            <span>상품 금액 ({orderItems.length}개)</span>
                            <span className="fw-normal">{formatPrice(orderDetail.totalAmount)}원</span>
                        </p>
                        <p className="d-flex justify-content-between mb-1">
                            <span>배송비</span>
                            <span className="fw-normal">0원</span>
                        </p>
                        <p className="d-flex justify-content-between fw-bold fs-6">
                            <span>총 결제 금액</span>
                            <span className="text-danger">{formatPrice(orderDetail.totalAmount)}원</span>
                        </p>
                        <p className="text-end text-muted" style={{fontSize: '0.8rem'}}>({orderDate} 결제)</p>
                    </section>

                    {/* 메인으로 버튼 */}
                    <div className="d-grid gap-2 my-4">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => nav('/')}
                            style={{ padding: '0.8rem', backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
                        >
                            메인으로
                        </Button>
                    </div>

                </div>
            </Container>
        </div>
    );
}

export default OrderDetailPage;