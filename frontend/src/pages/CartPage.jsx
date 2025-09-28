import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// react-bootstrap 컴포넌트 임포트
import { Container, Row, Col, Card, Button, Image, Form, Spinner, Alert } from 'react-bootstrap';
// 기존 훅 및 CSS 임포트 (확장자 제거 및 경로 조정)
import useCart from '../hooks/useCart';
import useCartSelection from '../hooks/useCartSelection';

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
        if (selectedItems.length === 0) return "주문 상품 0개";
        return `${selectedItems.length}건`;
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

            <h2 className="mb-4 text-2xl font-bold">장바구니</h2>

            <Row>
                {/* A. 장바구니 상품 목록 (좌측, 큰 영역) */}
                <Col lg={8} className="mb-4">
                    <Card className="shadow-lg rounded-xl">
                        <Card.Header className="bg-white border-bottom p-3">
                            <Row className="align-items-center">
                                <Col xs={6} md={3}>
                                    <Form.Check
                                        type="checkbox"
                                        id="selectAll"
                                        label="전체 선택"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="font-medium"
                                    />
                                </Col>
                                <Col xs={6} md={9} className="text-end">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleDeleteSelected}
                                        className="hover:bg-red-500 hover:text-white transition duration-200 rounded-lg px-3 py-1"
                                    >
                                        선택 삭제
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Header>

                        {/* 장바구니 상품 리스트 */}
                        <Card.Body className="p-0">
                            {cartList.length === 0 ? (
                                <p className="text-center py-5 text-gray-500">장바구니에 담긴 상품이 없습니다.</p>
                            ) : (
                                cartList.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-3 border-b last:border-b-0 hover:bg-gray-50 transition duration-150"
                                    >
                                        <Row className="align-items-center">
                                            {/* 체크박스 */}
                                            <Col xs={1} className="d-flex justify-content-center">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => handleCheckboxChange(item.id)}
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
                                            <Col xs={8} md={7} className="cursor-pointer" onClick={() => goProduct(item.productId)}>
                                                <div className="font-semibold text-lg hover:text-blue-600">{item.productName}</div>
                                                <small className="text-gray-600 block">{item.sellerBusinessName}</small>
                                                <p className="mb-1 text-sm text-gray-700">
                                                    옵션: {item.productSize}, {item.productColor} | 수량: {item.quantity}개
                                                </p>
                                                <div className="font-bold text-lg text-black">
                                                    {formatPrice(item.discountedProductPrice)}원
                                                </div>
                                            </Col>

                                            {/* 액션 버튼 */}
                                            <Col xs={12} md={2} className="text-end mt-2 mt-md-0">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-lg"
                                                >
                                                    삭제
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* B. 결제 정보 요약 (우측, 작은 영역) */}
                <Col lg={4}>
                    <Card className="shadow-lg rounded-xl sticky top-4">
                        <Card.Body>
                            <h3 className="text-xl font-bold mb-3 border-b pb-2">결제 정보</h3>

                            {/* 상품 금액 */}
                            <div className="d-flex justify-content-between mb-2 text-gray-700">
                                <span>상품 금액 (선택 상품)</span>
                                <span>{formatPrice(totalOriginalPrice)}원</span>
                            </div>

                            {/* 배송비 */}
                            <div className="d-flex justify-content-between mb-2 text-gray-700">
                                <span>배송비</span>
                                <span>(무료배송)</span>
                            </div>

                            {/* 상품 할인 */}
                            <div className="d-flex justify-content-between mb-3 text-red-600">
                                <span>상품 할인</span>
                                <span className="font-bold">-{formatPrice(totalDiscount)}원</span>
                            </div>

                            {/* 총 구매 금액 */}
                            <div className="d-flex justify-content-between align-items-center border-t pt-3 mt-3">
                                <span className="text-lg font-bold">총 구매 금액</span>
                                <span className="text-2xl font-extrabold text-blue-800">{formatPrice(totalDiscountedPrice)}원</span>
                            </div>

                            {/* 주문 및 AI 버튼 */}
                            <div className="d-grid gap-2 mt-4">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={goSelectedItemsOrder}
                                    disabled={selectedItems.length === 0 || isLoading}
                                    className="order-btn rounded-xl"
                                >
                                    {getOrderSummary()} 주문하기
                                </Button>
                                <Button
                                    variant="outline-dark"
                                    onClick={onAIForm}
                                    disabled={selectedItems.length === 0 || isLoading}
                                    className="rounded-xl"
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
