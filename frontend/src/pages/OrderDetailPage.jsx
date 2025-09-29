import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Image as BootstrapImage, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import defaultImage from "../assets/user.jpg";
import 'bootstrap/dist/css/bootstrap.min.css';
import './OrderDetailPage.css';
// ⚠️ ReviewForm의 경로는 실제 파일 위치에 맞게 수정이 필요할 수 있습니다.
import ReviewForm from '../components/productdetail/ReviewForm.jsx';

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

    // 💡 리뷰 모달 관련 상태 추가
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentReviewTarget, setCurrentReviewTarget] = useState(null); // 리뷰 작성 대상 상품 정보 저장 (productId 등)

    const { api } = useAuth();

    const getImageUrl = (imageId) => {
        return imageId ? `${api.defaults.baseURL}/image/${imageId}` : defaultImage;
    };

    // 💡 리뷰 작성 버튼 클릭 핸들러
    const handleReviewButtonClick = (item) => {
        // 리뷰 작성 대상 상품 정보 저장 (OrderItem DTO에 productId가 있어야 함)
        console.log(item);
        setCurrentReviewTarget({
            productId: item.productId,
            productName: item.productName
        });
        setShowReviewModal(true);
    };

    // 💡 리뷰 등록 완료 후 처리 (모달 닫기)
    const handleReviewSubmitted = () => {
        // 리뷰 등록 후 모달 닫기
        setShowReviewModal(false);
        // 필요하다면, 여기에 주문 상세 정보를 다시 불러와서(fetchOrderDetail) '리뷰 작성' 버튼을 '리뷰 완료' 등으로 업데이트하는 로직을 추가할 수 있습니다.
    };

    useEffect(() => {
        if (!orderId) {
            setError("주문 ID가 유효하지 않습니다.");
            setIsLoading(false);
            return;
        }


        const fetchOrderDetail = async () => {
            try {
                // 백엔드 엔드포인트: GET /order/{orderId}
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, api, numericOrderId]);
    // 💡 의존성 배열에 fetchOrderDetail을 넣지 않기 위해 함수를 밖에 뒀고, eslint 경고를 무시합니다. (api, numericOrderId만 유지)


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

    // DTO 구조에 맞춰 필드 접근
    const receiverName = orderDetail.userName || '수령인 정보 없음';
    const sellerOrders = orderDetail.orders || []; // 판매자별 주문 그룹 (OrderDTO 리스트)
    const orderDate = orderDetail.orderDate ? new Date(orderDetail.orderDate).toLocaleDateString('ko-KR') : '날짜 정보 없음';

    // 전체 상품 개수 계산
    const totalItemCount = sellerOrders.reduce((total, group) => total + group.orderItems.length, 0);

    // 백엔드 상태를 한글로 변환하여 비교하기 위한 Map (DeliveryDTO의 status 필드를 사용한다고 가정)
    const statusMap = {
        'READY': '배송 준비',
        'SHIPPED': '택배사 전달',
        'IN_TRANSIT': '상품 이동 중',
        'OUT_FOR_DELIVERY': '배달 출발',
        'DELIVERED': '배송 완료',
    };
    const deliverySteps = ['배송 준비', '택배사 전달', '상품 이동 중', '배달 출발', '배송 완료'];

    // 배송 현황 트래커 컴포넌트
    const DeliveryStatusTracker = ({ currentStatus }) => {
        const currentKoreanStatus = statusMap[currentStatus] || statusMap['READY'];
        const currentStepIndex = deliverySteps.indexOf(currentKoreanStatus);

        return (
            <div className="d-flex justify-content-between align-items-center delivery-steps-container mb-4">
                {deliverySteps.map((step, index) => {
                    // 현재 단계의 인덱스와 목표 단계의 인덱스를 비교하여 완료/활성 상태를 결정
                    const isCompleted = currentStepIndex >= index;
                    const isActive = currentStepIndex === index;

                    return (
                        <div
                            key={step}
                            className={`delivery-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        >
                            {/* 원형 아이콘 */}
                            <div className="step-circle">{step}</div>

                            {/* 연결선 (마지막 요소 제외) */}
                            {index < deliverySteps.length - 1 && (
                                <div className="step-line"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };
    
    // 💡 배송 완료 상태 여부
    const isOrderDelivered = sellerOrders.length > 0 && sellerOrders.every(group =>
        group.delivery?.status === 'DELIVERED'
    );
    return (
        <div className="bg-light min-vh-100 d-flex justify-content-center">
            <Container className="p-0 bg-white" style={{ maxWidth: '768px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)' }}>

                {/* 주문 상세 내역 헤더 */}
                <header className="py-3 px-3 border-bottom d-flex align-items-center">
                    <button onClick={() => nav(-1)} className="btn btn-link text-dark p-0 me-2" style={{ textDecoration: 'none' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <h1 className="fs-4 fw-bold mb-0">주문 상세 내역</h1>
                </header>

                <div className="p-3">

                    {/* 배송지 정보 섹션 (공통) */}
                    <section className="pb-3 border-bottom">
                        <h2 className="fs-5 fw-bold mb-3 text-start">수령 및 배송 정보</h2>
                        <p className="fw-bold mb-1">{receiverName}
                            <span className="badge bg-secondary ms-2" style={{ fontSize: '0.75rem' }}>수령인</span>
                        </p>
                        <p className="mb-1">{orderDetail.street} {orderDetail.detail}</p>
                        <p className="mb-0">{orderDetail.zipcode}</p>
                        <p className="text-muted mt-2 mb-0" style={{fontSize: '0.9rem'}}>요청사항: {orderDetail.requestMsg || ''}</p>
                    </section>


                    {/* ----------------- 판매자별 주문 및 배송 현황 ----------------- */}
                    {sellerOrders.map((group, groupIndex) => {
                        const delivery = group.delivery; // DeliveryDTO
                        const currentStatus = delivery ? delivery.status : 'READY';
                        const isDeliveryInfoAvailable = delivery && delivery.trackingNumber;
                        return (
                            <section key={groupIndex} className={`py-3 ${groupIndex < sellerOrders.length - 1 ? 'border-bottom' : ''}`}>
                                {/* 판매자 이름 및 배송 상태 */}
                                <h2 className="fs-5 fw-bold mb-3 text-start d-flex justify-content-between align-items-center">
                                    {group.sellerBusinessName}
                                    <span className={`badge ${currentStatus === 'DELIVERED' ? 'bg-success' : 'bg-primary'} ms-2`} style={{ fontSize: '0.9rem' }}>
                                        {statusMap[currentStatus] || '오류'}
                                    </span>
                                </h2>

                                {/* 배송 현황 (판매자별) */}
                                <DeliveryStatusTracker currentStatus={currentStatus} />

                                {/* 배송 정보 */}
                                <p className="text-muted mb-2" style={{fontSize: '0.9rem'}}>
                                    {isDeliveryInfoAvailable
                                        ? `운송장 번호: ${delivery.trackingNumber}`
                                        : '운송장 정보 준비 중입니다.'
                                    }
                                </p>

                                {/* 그룹 내 상품 목록 */}
                                <div className="mt-3">
                                    {group.orderItems.map((item, itemIndex) => (
                                        <div key={itemIndex} className="d-flex align-items-start justify-content-around mb-3">
                                            <BootstrapImage
                                                alt={item.name}
                                                src={getImageUrl(item.imageId)}
                                                className="me-3 rounded"
                                                style={{ width: '100px', height: '140px', objectFit: 'cover' }}
                                            />
                                            <div className="d-flex flex-column justify-content-center">
                                                <p className="fw-semibold mb-1" style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                                                    {item.name}
                                                </p>
                                                <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                                    {item.color} / {item.size} / {item.quantity}개
                                                </p>
                                                {/* 원가와 할인가 (originPrice는 원가, price는 할인가) */}
                                                <p className="text-muted text-decoration-line-through mb-0" style={{ fontSize: '0.8rem' }}>
                                                    {formatPrice(item.originPrice)}원
                                                </p>
                                                <p className="fw-bold mb-0 text-danger" style={{ fontSize: '1.05rem' }}>
                                                    {formatPrice(item.price)}원
                                                </p>
                                            </div>
                                            <div className="ms-3 align-self-center">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    disabled={!isOrderDelivered}
                                                    onClick={() => handleReviewButtonClick(item)}
                                                >
                                                    리뷰 작성하기
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                    {/* ----------------- 판매자별 주문 및 배송 현황 종료 ----------------- */}


                    {/* 총 결제 정보 섹션 */}

                    <section className="py-3 border-top">
                        <h2 className="fs-5 fw-bold mb-3 text-start">최종 결제 금액</h2>

                
                        <p className="d-flex justify-content-between mb-1">
                            <span>상품 금액 ({totalItemCount}개)</span>
                            <span className="fw-normal">{formatPrice(orderDetail.totalAmount)}원</span>
                        </p>
                        <p className="d-flex justify-content-between mb-1">
                            <span>배송비</span>
                            <span className="fw-normal">0원</span>
                            {/* 실제 배송비는 DTO에 없으므로 0원으로 고정 */}
                        </p>
                        <p className="d-flex justify-content-between fw-bold fs-6 border-top pt-2 mt-2">
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

            {/* 💡 리뷰 작성 모달 */}
            <Modal
                show={showReviewModal}
                onHide={() => setShowReviewModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {currentReviewTarget?.productName} 리뷰 작성
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentReviewTarget && (
                        <ReviewForm
                            productId={currentReviewTarget.productId}
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default OrderDetailPage;