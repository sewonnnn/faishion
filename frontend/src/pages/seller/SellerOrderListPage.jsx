import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Container, Table, Button, Form, Pagination, Alert, Row, Col } from 'react-bootstrap';
import './OrderManagementPage.css'; // 새로운 CSS 파일을 import 합니다.

function OrderManagementPage() {
    const [ordersPage, setOrdersPage] = useState({
        content: [],
        totalPages: 0,
        number: 0,
        size: 10,
        totalElements: 0,
    });
    const { api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [shippingInputs, setShippingInputs] = useState({});
    const [isShipping, setIsShipping] = useState({});

    const { number: currentPage, size: pageSize, totalPages } = ordersPage;

    const getTotalAmount = (orderItems) => {
        return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const fetchOrders = useCallback(async (page, size) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/order/seller', {
                params: {
                    page: page,
                    size: size
                }
            });
            setOrdersPage(response.data);
        } catch (err) {
            console.error("주문 목록을 불러오는 중 오류 발생:", err);
            setError("주문 목록을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [api]);

    const handleInputChange = (orderId, value) => {
        setShippingInputs(prev => ({
            ...prev,
            [orderId]: {
                trackingNumber: value
            }
        }));
    };

    const handleShipOrder = async (orderId) => {
        const trackingNumber = shippingInputs[orderId]?.trackingNumber;

        if (!trackingNumber || trackingNumber.trim() === '') {
            alert('송장 번호를 입력해주세요.');
            return;
        }

        setIsShipping(prev => ({ ...prev, [orderId]: true }));
        try {
            await api.post('/delivery', {
                order : {
                    id : orderId
                },
                trackingNumber
            });
            alert(`주문 ID ${orderId} 발송 처리 완료.`);
            await fetchOrders(currentPage, pageSize);
        } catch (err) {
            console.error(`주문 ID ${orderId} 배송 처리 중 오류 발생:`, err);
            alert('배송 처리 중 오류가 발생했습니다.');
        } finally {
            setIsShipping(prev => ({ ...prev, [orderId]: false }));
        }
    };

    useEffect(() => {
        fetchOrders(currentPage, pageSize);
    }, [currentPage, pageSize, fetchOrders]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setOrdersPage(prev => ({ ...prev, number: newPage }));
        }
    };

    const renderOrderItems = (orderItems) => (
        <div className="text-start">
            {orderItems.map((item, index) => (
                <div key={index} className={index > 0 ? "mt-2 pt-2 border-top" : ""}>
                    <strong>{item.name}</strong>
                    <br />
                    <small>{`옵션: ${item.color}, ${item.size} / 수량: ${item.quantity}개`}</small>
                    <br />
                    <small>개별 가격: {item.price.toLocaleString()}원</small>
                </div>
            ))}
        </div>
    );

    if (loading && Object.keys(isShipping).length === 0) return (
        <Container className="my-5">
            <Alert variant="info">주문 목록을 불러오는 중...</Alert>
        </Container>
    );

    if (error) return (
        <Container className="my-5">
            <Alert variant="danger">오류: {error}</Alert>
        </Container>
    );

    return (
        <Container className="order-management-container my-4">
            <h3 className="mb-4">주문 현황 관리</h3>

            <Table hover responsive className="management-table text-center">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>상품 정보</th>
                    <th>결제 금액</th>
                    <th>배송 정보</th>
                </tr>
                </thead>
                <tbody>
                {ordersPage.content.length > 0 ? (
                    ordersPage.content.map((order) => {
                        const isShipped = !!order.delivery;
                        const currentTrackingNumber = shippingInputs[order.id]?.trackingNumber || '';
                        const totalAmount = getTotalAmount(order.orderItems);
                        const shippingLoading = isShipping[order.id] || false;

                        return (
                            <tr key={order.id}>
                                <td className="align-middle">{order.id}</td>
                                <td className="align-middle">{renderOrderItems(order.orderItems)}</td>
                                <td className="align-middle fw-bold">{totalAmount.toLocaleString()}원</td>
                                <td className="align-middle text-start p-3">
                                    <div className="address-display mb-3">
                                        <p className="mb-1">
                                            <span className="fw-bold me-2">수령 주소:</span>
                                            ({order.zipcode || 'N/A'}) {order.street || '주소 정보 없음'} {order.detail || ''}
                                        </p>
                                        <p className="mb-0">
                                            <span className="fw-bold me-2">요청사항:</span>
                                            {order.requestMsg || '없음'}
                                        </p>
                                    </div>
                                    {/* ======================================================= */}

                                    <div className="shipping-info-cell">
                                        {isShipped ? (
                                            <>
                                                <p className="mb-2 fw-bold">
                                                    송장 번호: {order.delivery.trackingNumber}
                                                </p>
                                                <Alert variant="success" className="p-2 mb-0 w-100 text-center">
                                                    {order.delivery.status}
                                                </Alert>
                                            </>
                                        ) : (
                                            <Form>
                                                <Row className="align-items-center justify-content-center g-2">
                                                    <Col xs={12} md={8}>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="송장 번호 입력"
                                                            value={currentTrackingNumber}
                                                            onChange={(e) => handleInputChange(order.id, e.target.value)}
                                                            disabled={shippingLoading}
                                                        />
                                                    </Col>
                                                    <Col xs={12} md={4}>
                                                        <Button
                                                            className="action-button-gray w-100"
                                                            onClick={() => handleShipOrder(order.id)}
                                                            disabled={shippingLoading || !currentTrackingNumber.trim()}
                                                        >
                                                            {shippingLoading ? '처리 중...' : '수정'}
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan="4">
                            <Alert variant="warning" className="my-2">주문 내역이 없습니다.</Alert>
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>

            {/* 페이지네이션 */}
            <div className="d-flex justify-content-center mt-4">
                <Pagination className="management-pagination">
                    <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0 || loading}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                            key={index}
                            active={index === currentPage}
                            onClick={() => handlePageChange(index)}
                            disabled={loading}
                        >
                            {index + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1 || loading}
                    />
                </Pagination>
            </div>
        </Container>
    );
}

export default OrderManagementPage;