import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// react-bootstrap 컴포넌트 임포트
import { Container, Row, Col, Card, Button, Image, Form, Spinner, Alert } from 'react-bootstrap';
// 기존 훅 및 CSS 임포트 (확장자 제거 및 경로 조정)
import useCart from '../hooks/useCart';
import useCartSelection from '../hooks/useCartSelection';
import '../pages/CartPage.css'; // 새로 추가될 CSS 파일을 위한 임포트

// 헬퍼 함수: 금액을 쉼표 형식으로 포맷
const formatPrice = (price) => {
    // price가 유효한 숫자가 아닐 경우 0으로 처리 (오류 방지)
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    return validPrice.toLocaleString('ko-KR');
};

const CartPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    // 메시지 박스 상태 관리 (alert 대체)
    const [message, setMessage] = useState(null);
    // 이미지 로드 오류 상태 관리
    const [imageError, setImageError] = useState({});

    // 1. 장바구니 데이터 및 전체 목록 가져오기
    const { cartList, fetchCartData } = useCart();

    // 2. 체크박스 선택 및 삭제 로직 가져오기
    const {
        selectedItems,
        isAllSelected,
        handleCheckboxChange,
        handleSelectAll,
        handleDelete,
        handleDeleteSelected,
    } = useCartSelection(cartList, fetchCartData);

    // 3. 선택된 상품들의 가격만 useMemo를 사용하여 계산
    const { totalOriginalPrice, totalDiscountedPrice, totalDiscount } = useMemo(() => {
        const selectedProducts = cartList.filter(item => selectedItems.includes(item.id));

        const calculatedTotalOriginalPrice = selectedProducts.reduce((acc, item) => {
            return acc + (item.productPrice * item.quantity);
        }, 0);

        const calculatedTotalDiscountedPrice = selectedProducts.reduce((acc, item) => {
            // discountedProductPrice가 item.productPrice * (1 - discountRate)이 적용된 가격이라고 가정
            return acc + (item.discountedProductPrice * item.quantity);
        }, 0);

        const calculatedTotalDiscount = calculatedTotalOriginalPrice - calculatedTotalDiscountedPrice;

        return {
            totalOriginalPrice: calculatedTotalOriginalPrice,
            totalDiscountedPrice: calculatedTotalDiscountedPrice,
            totalDiscount: calculatedTotalDiscount,
        };
    }, [cartList, selectedItems]);

    // 주문하기 (메시지 박스 사용)
    const goSelectedItemsOrder = async () => {
        if (selectedItems.length === 0) {
            setMessage({ type: 'warning', text: '주문할 상품을 선택해주세요.' });
            return;
        }

        setIsLoading(true);
        const cartIds = selectedItems.join(",");
        console.log("선택된 상품들의 id들: " + cartIds);

        try {
            // 백엔드 API 호출
            const res = await axios.get("http://localhost:8080/order/new", {
                params: { ids: cartIds },
            });
            console.log("주문서 데이터 불러오기 성공:", res.data);

            // 받은 데이터와 함께 페이지 이동
            navigate("/order/new", {
                state: { ids: cartIds },
                replace: false,
            });
        } catch (e) {
            console.error("함수 실행 중 오류 발생:", e);
            setMessage({ type: 'danger', text: '주문서 불러오기에 실패했습니다.' });
        } finally {
            setIsLoading(false);
        }
    };

    // AI로 옷 입어보기 (메시지 박스 사용)
    const onAIForm = async () => {
        if (selectedItems.length === 0) {
            setMessage({ type: 'warning', text: 'AI로 옷 입어보기를 할 상품을 선택해주세요.' });
            return;
        }

        setIsLoading(true);
        const cartIds = selectedItems.join(",");

        try {
            // 백엔드 API 호출하여 선택된 상품들의 stockId 리스트를 가져옴
            const res = await axios.get("api/gemini/cart-stocks", {
                params: { ids: cartIds }
            });

            const stockIds = res.data.stockIds;

            // stockId 리스트를 URL 파라미터로 넘겨 AI 페이지로 이동
            navigate(`/gemini/try-on?stockIds=${stockIds}`);
        } catch (e) {
            console.error("AI로 옷 입어보기 실패:", e);
            setMessage({ type: 'danger', text: 'AI로 옷 입어보기에 실패했습니다. 다시 시도해주세요.' });
        } finally {
            setIsLoading(false);
        }
    };

    // 이미지 로드 실패 처리
    const handleImageError = (id) => {
        setImageError(prev => ({ ...prev, [id]: true }));
    };

    // 주문 상품 개수 요약
    const getOrderSummary = () => {
        if (selectedItems.length === 0) return "0건 주문하기";
        return `${selectedItems.length}건 주문하기`;
    };

    // 상품 상세로 이동
    const goProduct = (productId) => {
        console.log("상품 상세 이동 상품 id:" + productId);
        navigate(`/product/${productId}`);
    };

    return (
        <Container className="my-5">
            {/* 로딩 스피너 및 메시지 표시 */}
            {isLoading && (
                <div className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-opacity-50 bg-light" style={{ zIndex: 1050 }}>
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {/* 사용자 피드백 메시지 */}
            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="mb-4">
                    {message.text}
                </Alert>
            )}

            <h2 className="mb-4 text-2xl font-bold"></h2> {/* 장바구니 제목 삭제 */}

            <Row className="justify-content-center"> {/* 중앙 정렬 추가 */}
                {/* A. 장바구니 상품 목록 (좌측, 큰 영역) */}
                <Col lg={8} className="mb-4">
                    <Card className="shadow-none border-0 rounded-0"> {/* 그림자 및 둥근 모서리 제거, 테두리 제거 */}
                        <Card.Header className="bg-white border-bottom p-0 pb-3"> {/* 패딩 조정 */}
                            <Row className="align-items-center">
                                <Col xs={6} md={3}>
                                    <Form.Check
                                        type="checkbox"
                                        id="selectAll"
                                        label="전체 선택"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="font-medium custom-checkbox-text" // 커스텀 클래스 추가
                                    />
                                </Col>
                                <Col xs={6} md={9} className="text-end">
                                    <Button
                                        variant="link" // 링크 스타일로 변경
                                        size="sm"
                                        onClick={handleDeleteSelected}
                                        className="text-dark p-0" // 텍스트 색상 및 패딩 조정
                                        style={{textDecoration: 'none'}} // 밑줄 제거
                                    >
                                        선택 삭제
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Header>

                        {/* 장바구니 상품 리스트 */}
                        <Card.Body className="p-0 pt-3"> {/* 패딩 조정 */}
                            {cartList.length === 0 ? (
                                <p className="text-center py-5 text-gray-500">장바구니에 담긴 상품이 없습니다.</p>
                            ) : (
                                cartList.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-3 border rounded-3 mb-3" // 이미지에 맞게 테두리 및 마진 추가, 둥근 모서리
                                    >
                                        {/* 상단 할인 정보 */}
                                        {item.discountRate > 0 && ( // 할인율이 있을 경우에만 표시
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-primary text-white text-xs px-2 py-1 rounded-sm me-2" style={{backgroundColor: '#1850DB'}}>
                                                    할인율 {item.discountRate}%
                                                </div>
                                                <small className="text-muted">{item.discountedQuantity}개</small> {/* 할인 개수 정보 추가 (가정) */}
                                            </div>
                                        )}


                                        <Row className="align-items-center">
                                            {/* 체크박스 */}
                                            <Col xs={1} className="d-flex justify-content-center">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => handleCheckboxChange(item.id)}
                                                    className="custom-checkbox-input" // 커스텀 클래스 추가
                                                />
                                            </Col>

                                            {/* 이미지 및 대체 텍스트 */}
                                            <Col xs={3} md={2}>
                                                {imageError[item.id] ? (
                                                    <div className="d-flex justify-content-center align-items-center bg-gray-200 rounded text-gray-500" style={{ width: '100%', aspectRatio: '1/1', maxHeight: '8rem' }}>
                                                        <small>이미지 없음</small>
                                                    </div>
                                                ) : (
                                                    <Image
                                                        src={`http://localhost:8080/image/${item.productImageId}`}
                                                        alt={item.productName}
                                                        fluid
                                                        rounded
                                                        className="w-full h-auto object-cover max-h-32"
                                                        style={{ aspectRatio: '1/1' }}
                                                        onError={() => handleImageError(item.id)}
                                                    />
                                                )}
                                            </Col>

                                            {/* 상품 정보 */}
                                            <Col xs={8} md={7} className="cursor-pointer" onClick={() => goProduct(item.productId)}> {/* 상품 이름 클릭 시 이동 */}
                                                <div className="text-sm text-gray-500 mb-1"><b>{item.sellerBusinessName}</b></div>
                                                <div className="font-semibold text-lg mb-1 hover:text-blue-600" >{item.productName}</div>
                                                <p className="mb-1 text-sm text-gray-700">
                                                    옵션: {item.productSize}, {item.productColor} | 수량: {item.quantity}개
                                                </p>
                                                <div className="font-bold text-xl text-black">
                                                    <b> {formatPrice(item.discountedProductPrice)}원 </b>
                                                </div>
                                            </Col>

                                            {/* 액션 버튼 */}
                                            <Col xs={12} md={2} className="text-end mt-2 mt-md-0">
                                                <Button
                                                    variant="outline-secondary" // 이미지에 맞게 variant 변경
                                                    size="sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-lg border-0 bg-light text-dark" // 테두리 없애고 배경색 변경
                                                >
                                                    삭제
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                ))
                            )}

                            {/* 무료배송 정보 */}
                            {cartList.length > 0 && (
                                <div className="bg-light p-3 rounded-3 mt-4" style={{backgroundColor: '#EBF1FF'}}> {/* 배경색 변경 */}
                                    <p className="mb-0 text-sm" style={{color: '#1850DB'}}>
                                        <i className="bi bi-truck me-2"></i> "Faishion"에서는 모든 상품 무료배송!
                                    </p>
                                </div>
                            )}

                            {/* 선택된 상품들의 금액 요약 */}
                            {cartList.length > 0 && (
                                <Card className="shadow-none border-0 rounded-0 mt-4">
                                    <Card.Body className="p-0">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>상품금액</span>
                                            <span>{formatPrice(totalOriginalPrice)}원</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>배송비</span>
                                            <span>0원</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>할인금액</span>
                                            <span>{formatPrice(totalDiscount)}원</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="font-weight-bold">예상 결제 금액</span>
                                            <span className="text-xl font-weight-bold">{formatPrice(totalDiscountedPrice)}원</span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                        </Card.Body>
                    </Card>
                </Col>

                {/* B. 결제 정보 요약 (우측, 작은 영역) */}
                <Col lg={4}>
                    <Card className="rounded-xl sticky top-4">
                        <Card.Body className="p-4"> {/* 패딩 조정 */}
                            <h3 className="text-xl font-bold mb-4 pb-2 border-bottom-0"><b>결제정보</b></h3>

                            {/* 상품 금액 */}
                            <div className="d-flex justify-content-between mb-2 text-gray-700">
                                <span>상품금액</span>
                                <span>{formatPrice(totalOriginalPrice)}원</span>
                            </div>

                            {/* 배송비 */}
                            <div className="d-flex justify-content-between mb-2 text-gray-700">
                                <span>배송비</span>
                                <span>무료배송</span>
                            </div>

                            {/* 할인금액 */}
                            <div className="d-flex justify-content-between mb-2 text-gray-700">
                                <span>할인금액</span>
                                <span>{formatPrice(totalDiscount)}원</span>
                            </div>
                            {/* 총 구매 금액 */}
                            <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
                                <span className="text-lg font-bold">총 구매 금액</span>
                                <span className="text-2xl font-extrabold" style={{color: '#1850DB'}}>{formatPrice(totalDiscountedPrice)}원</span>
                            </div>

                            {/* 주문 및 AI 버튼 */}
                            <div className="d-grid gap-2 mt-4">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={goSelectedItemsOrder}
                                    disabled={selectedItems.length === 0 || isLoading}
                                    className="order-btn rounded-2"
                                    style={{ backgroundColor : "#1850DB", borderColor: "#1850DB"}} // 버튼 색상 및 테두리 색상 적용
                                >
                                    {getOrderSummary()}
                                </Button>
                                <Button
                                    variant="outline-dark"
                                    onClick={onAIForm}
                                    disabled={selectedItems.length === 0 || isLoading}
                                    className="rounded-2"
                                >
                                    AI로 옷 입어보기

                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default CartPage;