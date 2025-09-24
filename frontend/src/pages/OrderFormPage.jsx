import './OrderFormPage.css';
import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom"
import axios from 'axios';
import {PaymentCheckoutPage} from "./tossPay/PaymentCheckoutPage.jsx";

const OrderFormPage = () => {
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    // ... (기존 useEffect, calculateTotals, getOrderSummary 함수는 동일)

    useEffect(() => {
        const {ids} = location.state;
        if (!ids) {
            setError("주문할 상품 ID가 없습니다.");
            setIsLoading(false);
            return;
        }

        // 2. Axios를 사용하여 GET 요청 보내기
        axios.get(`http://localhost:8080/order/new?ids=${ids}`)
            .then(response => {
                // Axios는 응답 데이터를 자동으로 .data에 넣어줌
                setOrderItems(response.data);
                setIsLoading(false);
                console.log('선택된 상품들:', response.data);
            })
            .catch(err => {
                if (err.response) {
                    setError(`서버 오류: ${err.response.status}`);
                } else if (err.request) {
                    // 요청은 보냈지만 응답을 받지 못한 경우
                    setError("네트워크 오류: 서버에 연결할 수 없습니다.");
                } else {
                    // 요청 설정 중 오류가 발생한 경우
                    setError("요청 설정 오류: " + err.message);
                }
                setIsLoading(false);
            });
    }, [location.state]); // `location.search` 대신 `location.state` 사용

    // 총 가격 계산
    const calculateTotals = () => {
        let totalOriginal = 0;
        let totalDiscounted = 0;
        let totalDisc = 0;

        orderItems.forEach(item => {
            totalOriginal += item.productPrice * item.quantity;
            totalDiscounted += item.discountedProductPrice * item.quantity;
            totalDisc += (item.productPrice - item.discountedProductPrice) * item.quantity;
        });

        return {
            totalOriginalPrice: totalOriginal,
            totalDiscountedPrice: totalDiscounted,
            totalDiscount: totalDisc
        };
    };

    const totals = calculateTotals();

    const getOrderSummary = () => {
        if (orderItems.length === 0) return "주문 상품 0개";
        // 첫 번째 상품명과 총 상품 수를 합쳐서 반환
        const firstItemName = orderItems[0].productName;
        const remainingCount = orderItems.length > 1 ? ` 외 ${orderItems.length - 1}건` : '';
        return `${firstItemName}${remainingCount}`;
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>오류가 발생했습니다: {error}</div>;

    return (
        <div className="cart-page-layout">
            {/* ... (기존 주문 상세 정보 영역은 동일) */}
            <div className="order-details-container">
                <h2 className="section-header">주문서</h2>
                <div className="order-section">
                    <div className="delivery-info-header">
                        <h3>박세원</h3>
                        <button className="change-address-btn">
                            배송지 변경
                        </button>
                    </div>
                    <p className="delivery-text">서울특별시 관악구</p>
                    <p className="delivery-text">010-1234-5678</p>
                    <select className="delivery-select">
                        <option>직접 수령</option>
                        <option>문 앞에 놔주세요</option>
                        <option>문 앞에 두고 벨 눌러주세요</option>
                        <option>경비실에 맡겨주세요</option>
                    </select>
                </div>
                <hr className="divider" />
                <h2 className="section-header">주문 상품 {orderItems.length}개</h2>
                {orderItems.map((item) => (
                    <div className="order-item" key={item.id}>
                        <img
                            src={`http://localhost:8080/image/${item.productImageId}`}
                            alt={item.productName}
                            className="product-image"
                        />
                        <div className="product-details">
                            <h4>{item.productName}</h4>
                            <p>{item.sellerBusinessName}</p>
                            <p>상세옵션: {item.productSize}, {item.productColor}</p>
                            <p>{item.quantity}개</p>
                            <div className="price-info">
                                <span className="original-price">{item.productPrice.toLocaleString()}원</span>
                                <span className="sale-price">{item.discountedProductPrice.toLocaleString()}원</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="price-summary-box">
                <h3 className="section-header">결제 정보</h3>
                <div className="price-item">
                    <span>상품금액</span>
                    <span>{totals.totalOriginalPrice.toLocaleString()}원</span>
                </div>
                <div className="price-item">
                    <span>배송비</span>
                    <span>(무료배송)</span>
                </div>
                <div className="price-item">
                    <span>상품할인</span>
                    <span>{totals.totalDiscount.toLocaleString()}원</span>
                </div>
                <div className="total-price">
                    <span>총 구매 금액</span>
                    <span>{totals.totalDiscountedPrice.toLocaleString()}원</span>
                </div>
                <PaymentCheckoutPage
                    totalAmount={totals.totalDiscountedPrice}
                    orderName={getOrderSummary()}
                />
            </div>
        </div>
    );
};

export default OrderFormPage;