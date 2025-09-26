import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../contexts/AuthContext.jsx";

function SellerOrderListPage() {
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

  const { number: currentPage, size: pageSize, totalPages } = ordersPage;

  const fetchOrders = useCallback(async (page, size) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/order/seller', {
        params: {
          page: page,
          size: size,
          sort: 'createdAt,desc',
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
  }, []);

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

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/seller/order/${orderId}/ship`, {
        trackingNumber
      });

      const updatedOrder = response.data;

      setOrdersPage(prevPage => ({
        ...prevPage,
        content: prevPage.content.map(order =>
          order.id === orderId
            ? updatedOrder
            : order
        ),
      }));

      alert(`주문 ID ${orderId} 발송 처리 완료.`);

    } catch (err) {
      console.error(`주문 ID ${orderId} 배송 처리 중 오류 발생:`, err);
      alert('배송 처리 중 오류가 발생했습니다. (이미 발송된 주문일 수 있습니다.)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, pageSize);
  }, [currentPage, pageSize, fetchOrders]);

  const handlePageChange = (newPage) => {
    setOrdersPage(prev => ({ ...prev, number: newPage }));
  };

  if (loading) return <div>주문 목록을 불러오는 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="seller-order-list-page">
      <h1>판매자 주문 목록 ({ordersPage.totalElements}건)</h1>

      <table>
        <thead>
          <tr>
            <th>주문 ID</th>
            <th>주문명</th>
            <th>총 결제 금액</th>
            <th>송장 번호</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {ordersPage.content.length > 0 ? (
            ordersPage.content.map((order) => {
                const isShipped = order.status === 'SHIPPING' || order.status === 'COMPLETED';
                const currentTrackingNumber = shippingInputs[order.id]?.trackingNumber || '';

                return (
                    <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.orderName}</td>
                        <td>{order.totalAmount.toLocaleString()}원</td>

                        <td>
                            <input
                                type="text"
                                placeholder="송장 번호 입력"
                                value={isShipped ? order.delivery?.trackingNumber : currentTrackingNumber}
                                onChange={(e) => handleInputChange(order.id, e.target.value)}
                                disabled={isShipped}
                                style={{ backgroundColor: isShipped ? '#e0ffe0' : 'white' }}
                            />
                        </td>

                        <td>
                            <button
                                onClick={() => handleShipOrder(order.id)}
                                disabled={isShipped}
                            >
                                {isShipped ? '발송 완료' : '발송 처리'}
                            </button>
                        </td>
                    </tr>
                );
            })
          ) : (
            <tr>
              <td colSpan="5">주문 내역이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          이전
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index)}
            style={{ fontWeight: index === currentPage ? 'bold' : 'normal' }}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          다음
        </button>

        <p>
          페이지 {currentPage + 1} / {totalPages}
        </p>
      </div>
    </div>
  );
}

export default SellerOrderListPage;