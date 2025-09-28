import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Form, Button, Row, Col, Card, Container, Spinner, Alert, Image } from "react-bootstrap";
import AddressModal from './customer/AddressModal.jsx';

// 헬퍼 함수: 금액을 쉼표 형식으로 포맷
const formatPrice = (price) => {
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    return validPrice.toLocaleString('ko-KR');
};

const initialDeliveryAddress = {
    zipcode: '',
    street: '',
    detail: '',
    requestMsg: '',
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


    // 기존 주소 관련 핸들러 제거 (handleAddressSelect, handleDetailChange, handleEditToggle, handleAddressSave)

    // 배송 요청사항 변경 핸들러 (유지)
    const handleRequestMsgChange = (e) => {
        setDeliveryAddress(prev => ({
            ...prev,
            requestMsg: e.target.value,
        }));
    };

    const handleModalAddressUpdate = useCallback((selectedAddress) => {
        if (selectedAddress) {
            setDeliveryAddress(prev => ({
                ...prev,
                zipcode: selectedAddress.zipcode || '',
                street: selectedAddress.street || '',
                detail: selectedAddress.detail || '',
                requestMsg: selectedAddress.requestMsg || '',
            }));
            setShowAddressModal(false); // 모달 닫기
        }
    }, []);

    // 주문서 로딩 시 사용자 정보와 함께 현재 적용된 배송지를 불러오는 로직
    const fetchCurrentDeliveryAddress = async (userData) => {
        // userData에 저장된 최근 주소 정보를 기반으로 초기 설정
        // userData.address?.zipcode 형태로 옵셔널 체이닝을 적용하여 안전하게 접근
        let currentAddress = {
            zipcode: userData.address?.zipcode || '',
            street: userData.address?.street || '',
            detail: userData.address?.detail || '',
            requestMsg: userData.address?.requestMsg || '',
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
                    const orderItemsResponse = await api.get(`/order/new?ids=${ids}`); // ids.join(',') 제거
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
        return {
            totalOriginalPrice: totalOriginal,
            totalDiscountedPrice: totalDiscounted,
            totalDiscount: totalDisc
        };
    }, [orderItems]);

    const getOrderSummary = useCallback(() => {
        if (orderItems.length === 0) return "주문 상품 0개";
        const firstItemName = orderItems[0].productName;
        const remainingCount = orderItems.length > 1 ? ` 외 ${orderItems.length - 1}건` : '';
        return `${firstItemName}${remainingCount}`;
    }, [orderItems]);

    // --- 결제 요청 (유지) ---
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
                })),
                requestMsg: deliveryAddress.requestMsg === '요청사항을 선택하세요' ? '' : deliveryAddress.requestMsg,
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
        <Container className="my-5">
            {/* 💡 AddressModal 컴포넌트 추가 */}
            <AddressModal
                show={showAddressModal}
                handleClose={() => setShowAddressModal(false)}
                handleAddressSelectForUse={handleModalAddressUpdate}
                handleAddressUpdated={()=>{}}
            />

            {/* 사용자 피드백 메시지 */}
            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="mb-4 shadow-sm">
                    {message.text}
                </Alert>
            )}

            <h2 className="mb-4 text-3xl font-extrabold text-gray-900">주문서 작성</h2>
            <Row>
                {/* A. 주문/배송 정보 (좌측, 큰 영역) */}
                <Col lg={8} className="mb-4">
                    {/* 배송지 정보 카드 */}
                    <Card className="shadow-lg rounded-xl mb-4">
                        <Card.Header className="bg-white border-bottom p-3">
                            <h3 className="text-xl font-bold">배송지 정보</h3>
                        </Card.Header>
                        <Card.Body>
                            <Row className="align-items-center mb-3">
                                <Col xs={6}><h4 className="text-lg font-semibold">{userProfile?.name || "사용자 이름"}님</h4></Col>
                                <Col xs={6} className="text-end">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        // 버튼 클릭 시 모달 열기
                                        onClick={() => setShowAddressModal(true)}
                                        className="rounded-lg px-3 py-1"
                                    >
                                        배송지 변경
                                    </Button>
                                </Col>
                            </Row>

                            {/* 기존 주소 변경 폼 (isAddressEditing 관련) 제거 */}

                            {/* 현재 배송지 정보 표시 (deliveryAddress 상태 사용) */}
                            <div className="mb-3 p-2 bg-light rounded">
                                <p className="mb-1 text-gray-700 font-medium">{`(${deliveryAddress.zipcode || "선택 필요"}) ${deliveryAddress.street || "배송지 주소"}`}</p>
                                <p className="mb-1 text-gray-700">{deliveryAddress.detail || "상세 주소"}</p>
                                <p className="mb-0 text-gray-700">연락처: {userProfile?.phoneNumber || "연락처 정보"}</p>
                            </div>

                            {/* 배송 요청사항 (유지) */}
                            <Form.Group as={Row} className="mt-4 align-items-center">
                                <Form.Label column sm="3" className="font-medium text-sm">배송 요청 (선택)</Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        as="textarea" // 여러 줄 입력을 위해 textarea 사용
                                        rows={2}      // 높이를 2줄로 설정
                                        value={deliveryAddress.requestMsg}
                                        onChange={handleRequestMsgChange}
                                        className="rounded-lg"
                                        placeholder="예: 문 앞에 놔주세요, 경비실에 맡겨주세요, 배송 전에 전화 부탁드립니다."
                                    />
                                </Col>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* 주문 상품 목록 카드 (유지) */}
                    <Card className="shadow-lg rounded-xl">
                        <Card.Header className="bg-white border-bottom p-3">
                            <h3 className="text-xl font-bold">주문 상품 {orderItems.length}개</h3>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {orderItems.map((item) => (
                                <div
                                    key={item.stockId}
                                    className="p-3 border-b last:border-b-0 hover:bg-gray-50 transition duration-150"
                                >
                                    <Row className="align-items-center">
                                        {/* 이미지 */}
                                        <Col xs={3} md={2}>
                                            <Image
                                                src={`http://localhost:8080/image/${item.productImageId}`}
                                                alt={item.productName}
                                                fluid
                                                rounded
                                                className="w-full h-auto object-cover max-h-32"
                                                style={{ aspectRatio: '1/1' }}
                                                // 에러 처리: 이미지 로드 오류 발생 시 대체 이미지 표시 등을 추가할 수 있음
                                            />
                                        </Col>

                                        {/* 상품 정보 */}
                                        <Col xs={9} md={10}>
                                            <div className="text-sm text-gray-600 mb-1">{item.sellerBusinessName}</div>
                                            <div className="font-semibold text-base mb-1">{item.productName}</div>
                                            <p className="mb-1 text-xs text-gray-500">
                                                옵션: {item.productSize}, {item.productColor} | 수량: {item.quantity}개
                                            </p>
                                            <div className="font-bold text-lg text-black">
                                                {item.discountedProductPrice != null && item.discountedProductPrice !== item.productPrice && (
                                                    <span className="text-sm text-gray-500 line-through me-2">
                                                        {formatPrice(item.productPrice * item.quantity)}원
                                                    </span>
                                                )}
                                                <span className="text-red-600">
                                                    {formatPrice((item.discountedProductPrice || item.productPrice) * item.quantity)}원
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>

                {/* B. 결제 정보 요약 (우측, 작은 영역) (유지) */}
                <Col lg={4}>
                    <Card className="shadow-lg rounded-xl sticky top-4">
                        <Card.Body>
                            <h3 className="text-xl font-bold mb-3 border-b pb-2">결제 정보</h3>

                            {/* 상품 금액 */}
                            <div className="d-flex justify-content-between mb-2 text-gray-700">
                                <span>상품 금액</span>
                                <span>{formatPrice(totals.totalOriginalPrice)}원</span>
                            </div>

                            {/* 배송비 */}
                            <div className="d-flex justify-content-between mb-2 text-gray-700">
                                <span>배송비</span>
                                <span className="text-success">(무료배송)</span>
                            </div>

                            {/* 상품 할인 */}
                            <div className="d-flex justify-content-between mb-3 text-red-600">
                                <span>상품 할인</span>
                                <span className="font-bold">-{formatPrice(totals.totalDiscount)}원</span>
                            </div>

                            {/* 총 구매 금액 */}
                            <div className="d-flex justify-content-between align-items-center border-t pt-3 mt-3">
                                <span className="text-lg font-bold">총 구매 금액</span>
                                <span className="text-2xl font-extrabold text-blue-800">{formatPrice(totals.totalDiscountedPrice)}원</span>
                            </div>

                            {/* 결제 버튼 */}
                            <div className="d-grid gap-2 mt-4">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={goTossPay}
                                    disabled={orderItems.length === 0 || isLoading}
                                    className="order-btn rounded-xl"
                                >
                                    {getOrderSummary()} 결제하기
                                </Button>
                            </div>
                            <small className="d-block text-center mt-2 text-gray-500">주문 내용을 확인하였으며, 정보 제공에 동의합니다.</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrderFormPage;