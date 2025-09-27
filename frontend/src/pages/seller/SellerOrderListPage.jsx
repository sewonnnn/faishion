import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Container, Table, Button, Form, Pagination, Alert, Row, Col } from 'react-bootstrap';
// axios import는 사용하지 않으므로 제거합니다. (api를 useAuth에서 가져오므로)

// 컴포넌트 이름은 OrderManagementPage로 유지합니다.
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

  // 송장 번호 입력을 위한 상태 (Order ID 기준)
  const [shippingInputs, setShippingInputs] = useState({});
  const [isShipping, setIsShipping] = useState({}); // 개별 발송 버튼 로딩 상태

  const { number: currentPage, size: pageSize, totalPages } = ordersPage;

  // 총 결제 금액 계산 함수 (기존과 동일)
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
      console.log(response.data);
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

  // 발송 처리 후, 주문 목록을 다시 불러오도록 (fetchOrders) 로직을 수정했습니다.
  const handleShipOrder = async (orderId) => {
    const trackingNumber = shippingInputs[orderId]?.trackingNumber;

    if (!trackingNumber || trackingNumber.trim() === '') {
      alert('송장 번호를 입력해주세요.');
      return;
    }

    setIsShipping(prev => ({ ...prev, [orderId]: true }));
    try {
      // API 호출 (기존 코드 그대로 POST /delivery 사용)
      await api.post('/delivery', {
        order : {
            id : orderId
        },
        trackingNumber
      });

      alert(`주문 ID ${orderId} 발송 처리 완료.`);

      // 발송 성공 후 현재 페이지를 다시 불러와 UI를 업데이트합니다.
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

  // 모든 상품 정보를 하나의 셀에 표시하기 위한 헬퍼 함수
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
    <Container className="my-4">
      {/* H1 태그의 내용을 '주문 현황 관리'로 수정 */}
      <h1 className="mb-4">주문 현황 관리 ({ordersPage.totalElements}건)</h1>

      {/* Table - responsive 속성으로 모바일에서 가로 스크롤 가능 */}
      <Table striped bordered hover responsive className="text-center">
        <thead>
          <tr>
            <th style={{ width: '10%' }}>ID</th>
            <th style={{ width: '35%' }}>상품 정보</th>
            <th style={{ width: '15%' }}>결제 금액</th>
            <th style={{ width: '40%' }}>배송 정보</th>
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
                  {/* 주문 ID */}
                  <td className="align-middle border-end">
                    <strong>{order.id}</strong>
                  </td>

                  {/* 모든 상품 정보 통합 */}
                  <td className="align-middle">
                    {renderOrderItems(order.orderItems)}
                  </td>

                  {/* 결제 금액 */}
                  <td className="align-middle border-end">
                    <strong>{totalAmount.toLocaleString()}원</strong>
                  </td>

                  {/* 배송 상태 / 송장 번호 / 주소 정보 추가 */}
                  <td className="align-middle text-start p-3">
                    <div className="mb-3 p-2 border rounded bg-light">
                        <span className="mb-1 me-2 fw-bold">수령 주소</span>
                        <span className="mb-0">({order.zipcode || 'N/A'}) {order.address || '주소 정보 없음'} {order.addressDetail || ''}</span>
                    </div>

                    <div className="d-flex flex-column align-items-center justify-content-center">
                      {isShipped ? (
                        // Delivery 정보가 있을 때 (발송 완료)
                        <>
                           <p className="mb-2 fw-bold">
                            송장 번호: {order.delivery.trackingNumber}
                          </p>
                          <Alert variant="success" className="p-2 mb-0 w-100 text-center">
                            {order.delivery.status}
                          </Alert>
                        </>
                      ) : (
                        // Delivery 정보가 없을 때 (발송 전)
                        <Form className="w-100">
                          <Row className="align-items-center justify-content-center">
                            <Col xs={12} className="mb-2">
                              <Form.Control
                                type="text"
                                placeholder="송장 번호 입력"
                                value={currentTrackingNumber}
                                onChange={(e) => handleInputChange(order.id, e.target.value)}
                                disabled={shippingLoading}
                              />
                            </Col>
                            <Col xs={12} className="text-center">
                              <Button
                                variant="primary"
                                onClick={() => handleShipOrder(order.id)}
                                disabled={shippingLoading || !currentTrackingNumber.trim()} // 송장 번호 없으면 비활성화
                                className="p-2 mb-0 w-100"
                              >
                                {shippingLoading ? '처리 중...' : '발송 처리'}
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

      {/* Pagination */}
      <div className="d-flex justify-content-center align-items-center mt-4">
        <Pagination>
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

        <span className="ms-3 text-muted">
          페이지 {currentPage + 1} / {totalPages}
        </span>
      </div>
    </Container>
  );
}

export default OrderManagementPage;