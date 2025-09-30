
import { Form, Button, Row, Col, Card, Container, Spinner, Alert, Image } from "react-bootstrap";
import AddressModal from './customer/AddressModal.jsx';
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// 경로 오류는 사용자 환경에 맞춰 다시 임포트합니다.
import { useAuth } from "../contexts/AuthContext.jsx";
import '../pages/OrderFormPage.css'; // 새로 생성할 CSS 파일 임포트


// 헬퍼 함수: 금액을 쉼표 형식으로 포맷
const formatPrice = (price) => {
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    return validPrice.toLocaleString('ko-KR');
};

const initialDeliveryAddress = {
    zipcode: '',
    street: '',
    detail: '',
    requestMsg: '문 앞에 놔주세요', // 이미지에 맞춰 초기값 설정
};

const OrderFormPage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); // 사용자 피드백 메시지 (Alert용)

    const location = useLocation();
    const navigate = useNavigate();
    const { api } = useAuth();

    const [deliveryAddress, setDeliveryAddress] = useState(initialDeliveryAddress);
    // AddressModal을 위한 상태 추가
    const [showAddressModal, setShowAddressModal] = useState(false);


    // 배송 요청사항 변경 핸들러 (유지)
    const handleRequestMsgChange = (e) => {
        setDeliveryAddress(prev => ({
            ...prev,
            requestMsg: e.target.value,
        }));
    };

    // 배송 요청사항 드롭다운 핸들러 (이미지 디자인에 맞춰 로직 수정)
    const handleRequestSelect = (e) => {
        const value = e.target.value;
        if (value === '직접 입력') {
            setDeliveryAddress(prev => ({
                ...prev,
                requestMsg: '', // 직접 입력 선택 시, 텍스트 입력 필드 활성화를 위해 빈 문자열로 설정
            }));
        } else {
            setDeliveryAddress(prev => ({
                ...prev,
                requestMsg: value,
            }));
        }
    };

    // 현재 배송 요청사항이 '직접 입력' 모드인지 확인
    const isCustomRequestMode = useMemo(() => {
        // '문 앞에 놔주세요', '경비실에 맡겨주세요', '배송 전에 전화 부탁드립니다.' 이외의 값이면 직접 입력 모드로 간주
        const predefined = ['문 앞에 놔주세요', '경비실에 맡겨주세요', '배송 전에 전화 부탁드립니다.'];
        return !predefined.includes(deliveryAddress.requestMsg) && deliveryAddress.requestMsg !== '';
    }, [deliveryAddress.requestMsg]);


    const handleModalAddressUpdate = useCallback((selectedAddress) => {
        if (selectedAddress) {
            setDeliveryAddress(prev => ({
                ...prev,
                zipcode: selectedAddress.zipcode || '',
                street: selectedAddress.street || '',
                detail: selectedAddress.detail || '',
                requestMsg: selectedAddress.requestMsg || initialDeliveryAddress.requestMsg,
            }));
            setShowAddressModal(false); // 모달 닫기
        }
    }, []);

    // 주문서 로딩 시 사용자 정보와 함께 현재 적용된 배송지를 불러오는 로직 (기능 유지)
    const fetchCurrentDeliveryAddress = async (userData) => {
        let currentAddress = {
            zipcode: userData.address?.zipcode || '',
            street: userData.address?.street || '',
            detail: userData.address?.detail || '',
            requestMsg: userData.address?.requestMsg || initialDeliveryAddress.requestMsg,
        };

        setDeliveryAddress(prev => ({
            ...prev,
            ...currentAddress,
        }));
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 1) 사용자 프로필
                const userResponse = await api.get('/user/');
                const userData = userResponse.data;
                setUserProfile(userData);

                // 2) 주소 세팅
                await fetchCurrentDeliveryAddress(userData);

                // 3) 주문 아이템 결정
                const state = location.state || {};
                const { ids, directItems } = state;

                if (Array.isArray(directItems) && directItems.length > 0) {
                    // 바로구매하는 경우
                    setOrderItems(directItems);
                    setIsLoading(false);
                    return;
                }
                // 장바구니에서 넘어온 경우
                if (ids && typeof ids === 'string' && ids.length > 0) {
                    const orderItemsResponse = await api.get(`/order/new?ids=${ids}`);
                    setOrderItems(orderItemsResponse.data);
                    setIsLoading(false);
                    return;
                }

                // 둘 다 없는 경우
                setError("주문할 상품 정보가 없습니다.");
                setIsLoading(false);
            } catch (err) {
                console.error("데이터 로딩 중 오류 발생:", err.response?.data || err.message);
                setError("데이터를 불러오는 데 실패했습니다.");
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [location.state, api]);


    // --- 계산된 값 (Totals, Summary) ---
    const totals = useMemo(() => {
        let totalOriginal = 0;
        let totalDiscounted = 0;
        let totalDisc = 0;
        orderItems.forEach(item => {
            const priceToUse = item.discountedProductPrice != null ? item.discountedProductPrice : item.productPrice;
            totalOriginal += item.productPrice * item.quantity;
            totalDiscounted += priceToUse * item.quantity;
            totalDisc += (item.productPrice - priceToUse) * item.quantity;
        });

        // 이미지에 맞춰 '장바구니 쿠폰' 할인 2,000원을 시뮬레이션
        const couponDiscount = 2000;
        const finalTotalDiscount = totalDisc + couponDiscount;
        const finalTotalDiscountedPrice = totalDiscounted - couponDiscount;

        return {
            totalOriginalPrice: totalOriginal,
            totalDiscountedPrice: finalTotalDiscountedPrice > 0 ? finalTotalDiscountedPrice : 0,
            totalDiscount: finalTotalDiscount,
            couponDiscount: couponDiscount,
        };
    }, [orderItems]);

    const getOrderSummary = useCallback(() => {
        if (orderItems.length === 0) return "0건";
        const totalProductsCount = orderItems.length; // 상품 종류 수
        return `${totalProductsCount}건`;
    }, [orderItems]);

    // --- 결제 요청 (기능 유지) ---
    const goTossPay = async () => {
        setMessage(null);
        if (orderItems.length === 0 || totals.totalDiscountedPrice <= 0) {
            setMessage({ type: 'danger', text: "결제할 상품 정보가 올바르지 않습니다." });
            return;
        }
        if (!userProfile || !userProfile.id ) {
            setMessage({ type: 'warning', text: "사용자 정보가 아직 로딩되지 않았습니다. 잠시 후 다시 시도해주세요." });
            return;
        }
        // 배송지 유효성 검사 (deliveryAddress 상태 사용)
        if (!deliveryAddress.zipcode || !deliveryAddress.street || !deliveryAddress.detail) {
            setMessage({ type: 'warning', text: "배송지 정보를 모두 입력해주세요." });
            return;
        }

        try {
            const requestData = {
                userId: userProfile.id,
                zipcode: deliveryAddress.zipcode,
                street: deliveryAddress.street,
                detail: deliveryAddress.detail,
                orderName: getOrderSummary(),
                totalAmount: totals.totalDiscountedPrice,
                items: orderItems.map(item => ({
                    stockId: item.stockId,
                    quantity: item.quantity,
                    price: item.discountedProductPrice != null ? item.discountedProductPrice : item.productPrice,
                    cartId: item.id, // 결제 후 장바구니 상품 삭제를 위함
                })),
                requestMsg: deliveryAddress.requestMsg,
            };
            const response = await api.post("/order/create", requestData);

            console.log(requestData);
            console.log(response.data);

            const { clientOrderId } = response.data;

            navigate('/order/check', {
                state: {
                    totalAmount: totals.totalDiscountedPrice,
                    orderName: requestData.orderName,
                    clientOrderId: clientOrderId,
                },
            });
        } catch (e) {
            console.error("주문 생성 중 오류 발생:", e.response?.data || e.message);
            setMessage({ type: 'danger', text: "주문을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요." });
        }
    };

    // --- 렌더링 상태 처리 (유지) ---
    if (isLoading) {
        return <Container className="my-5 text-center"><Spinner animation="border" variant="primary" /></Container>;
    }
    if (error) {
        return <Container className="my-5"><Alert variant="danger">오류가 발생했습니다: {error}</Alert></Container>;
    }
    if (orderItems.length === 0) {
        return <Container className="my-5"><Alert variant="info">주문할 상품이 없습니다.</Alert></Container>;
    }

    // --- 메인 렌더링 ---
    return (
        <Container className="my-5 order-form-page">
            <AddressModal
                show={showAddressModal}
                handleClose={() => setShowAddressModal(false)}
                handleAddressSelectForUse={handleModalAddressUpdate}
                handleAddressUpdated={()=>{}}
            />

            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="mb-4 shadow-sm">
                    {message.text}
                </Alert>
            )}

            <Row>
                {/* A. 주문/배송 정보 (좌측, 큰 영역) */}
                <Col lg={8} className="mb-4">
                    <h2 className="text-xl font-bold mb-4 border-bottom pb-2 order-section-title" >주문서</h2>
                    {/* 1. 배송지 정보 */}
                    <Card className="shadow-none border-0 mb-5 p-0">
                        <Card.Body className="p-0">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h4 className="text-lg font-bold mb-0 d-inline-block me-2"><b>{userProfile?.name || "박세원"}</b></h4>
                                    <span className="text-sm text-gray-500 font-medium delivery-tag">기본 배송지</span>
                                </div>

                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => setShowAddressModal(true)}
                                >
                                    배송지 변경
                                </Button>
                            </div>

                            {/* 배송지 기본 정보 */}
                            <p className="mb-1 text-base text-gray-800">
                                {`(${deliveryAddress.zipcode || "선택 필요"}) ${deliveryAddress.street || "배송지 주소"}`}
                            </p>
                            <p className="mb-1 text-gray-700">{deliveryAddress.detail || "상세 주소"}</p>

                            <p className="mb-4 text-base text-gray-800">
                                연락처: {userProfile?.phoneNumber || "연락처 정보"}
                            </p>

                            {/* 배송 요청사항 */}
                            <Form.Group as={Row} className="mt-4 align-items-center">

                                <Form.Label column sm="3" className="font-medium text-sm">배송 요청 (선택)</Form.Label>

                                <Col sm="9">
                                    <Form.Control
                                        as="textarea" // 여러 줄 입력을 위해 textarea 사용
                                        rows={2} // 높이를 2줄로 설정
                                        value={deliveryAddress.requestMsg}
                                        onChange={handleRequestMsgChange}
                                        className="rounded-lg"
                                        placeholder="예: 문 앞에 놔주세요, 경비실에 맡겨주세요, 배송 전에 전화 부탁드립니다."

                                    />
                                </Col>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <hr className="my-5 border-gray-200" />

                    {/* 2. 주문 상품 목록 */}
                    <h3 className="text-xl font-bold mb-4 order-section-title">주문 상품 {orderItems.length}개</h3>
                    <Card className="shadow-none border-0 p-0">
                        <Card.Body className="p-0">
                            {orderItems.map((item) => {
                                const originalPrice = item.productPrice * item.quantity;
                                const discountedPrice = (item.discountedProductPrice != null ? item.discountedProductPrice : item.productPrice) * item.quantity;
                                // 할인 여부 판단 (할인 가격이 존재하고, 원래 가격보다 낮은 경우)
                                const isDiscounted = item.discountedProductPrice != null && item.productPrice > item.discountedProductPrice;

                                return (
                                    <div
                                        key={item.stockId}
                                        className="p-0 mb-4 border-bottom pb-4 order-item-card"
                                    >
                                        <Row className="align-items-start">
                                            {/* 이미지 */}
                                            <Col xs={4} md={3}>
                                                <Image
                                                    src={`http://localhost:8080/image/${item.productImageId}`}
                                                    alt={item.productName}
                                                    fluid
                                                    rounded
                                                    className="w-full h-auto object-cover item-image"
                                                    style={{ aspectRatio: '1/1' }}
                                                />
                                            </Col>

                                            {/* 상품 정보 */}
                                            <Col xs={8} md={9}>
                                                <div className="text-sm text-gray-600 mb-1"><b>{item.sellerBusinessName || "점포명"}</b></div>
                                                <div className="font-semibold text-base mb-1">{item.productName}</div>
                                                <p className="mb-1 text-sm text-gray-500">
                                                    옵션: {item.productSize || "105"} / 수량: {item.quantity}개
                                                </p>

                                                {/* 할인 전 가격 (취소선) - 할인 적용 시에만 표시 */}
                                                {isDiscounted && (
                                                    <div className="original-price-strikethrough">
                                                        {formatPrice(originalPrice)}원
                                                    </div>
                                                )}

                                                {/* 최종 가격 (할인 적용 가격) */}
                                                <div className="discounted-price-final">
                                                    {formatPrice(discountedPrice)}원
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                );
                            })}
                        </Card.Body>
                    </Card>
                </Col>

                {/* B. 결제 정보 요약 (우측, 작은 영역) */}
                <Col lg={4}>
                    <Card className="shadow-none border-1 sticky-card">
                        <Card.Body className="p-4">
                            <h3 className="text-xl font-bold mb-4 pb-2"><b>결제 정보</b></h3>

                            {/* 상품 금액 */}
                            <div className="d-flex justify-content-between mb-3 text-gray-700 payment-detail-row">
                                <span>상품 금액</span>
                                <span>{formatPrice(totals.totalOriginalPrice)}원</span>
                            </div>

                            {/* 배송비 (이미지에서는 0원) */}
                            <div className="d-flex justify-content-between mb-3 text-gray-700 payment-detail-row">
                                <span>배송비</span>
                                <span>무료배송</span>
                            </div>

                            {/* 할인 금액 */}
                            <div className="d-flex justify-content-between mb-3 text-gray-700 payment-detail-row">
                                <span>할인 금액</span>
                                <span> -{formatPrice(totals.couponDiscount)}원</span>
                            </div>

                            {/* 총 결제 금액 */}
                            <div className="d-flex justify-content-between align-items-center border-top pt-4 mt-4 total-amount-row">
                                <span className="text-lg font-bold"><b>총 구매 금액</b></span>
                                <span className="text-2xl font-extrabold total-price"><b>{formatPrice(totals.totalDiscountedPrice)}원</b></span>
                            </div>

                            {/* 결제 버튼 */}
                            <div className="d-grid gap-2 mt-4">
                                <Button
                                    size="lg"
                                    onClick={goTossPay}
                                    disabled={orderItems.length === 0 || isLoading}
                                    className="order-pay-btn"
                                >
                                    {getOrderSummary()} 주문하기
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrderFormPage;