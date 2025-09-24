import './OrderFormPage.css';
import {useEffect, useState, useMemo, useCallback} from "react"; // useMemo, useCallback 추가
import {useLocation, useNavigate} from "react-router-dom"
import {useAuth} from "../contexts/AuthContext.jsx";

const OrderFormPage = () => {
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const {api} = useAuth();
    // 1. 주문 상품 ID를 받아와 백엔드에서 상품 정보 가져오기
    useEffect(() => {
        // location.state에서 ids를 가져옴
        const {ids} = location.state || {}; // null 체크를 위해 기본값 {} 추가

        if (!ids || ids.length === 0) { // ids가 없거나 비어있으면 오류 처리
            setError("주문할 상품 ID가 없습니다.");
            setIsLoading(false);
            return;
        }

        api.get(`/order/new?ids=${ids}`)
            .then(response => {
                setOrderItems(response.data);
                setIsLoading(false);
                console.log('선택된 상품들:', response.data);
            })
            .catch(err => {
                if (err.response) {
                    setError(`서버 오류: ${err.response.status} - ${err.response.data.message || '알 수 없는 오류'}`);
                } else if (err.request) {
                    setError("네트워크 오류: 서버에 연결할 수 없습니다.");
                } else {
                    setError("요청 설정 오류: " + err.message);
                }
                setIsLoading(false);
            });
    }, [location.state]); // location.state가 변경될 때마다 재실행

    // 총 가격 계산
    const totals = useMemo(() => {
        let totalOriginal = 0;
        let totalDiscounted = 0;
        let totalDisc = 0;

        orderItems.forEach(item => {
            totalOriginal += item.productPrice * item.quantity;
            // 할인가가 있으면 할인가 적용, 없으면 원래 가격 적용
            const priceToUse = item.discountedProductPrice != null ? item.discountedProductPrice : item.productPrice;
            totalDiscounted += priceToUse * item.quantity;
            totalDisc += (item.productPrice - priceToUse) * item.quantity;
        });

        return {
            totalOriginalPrice: totalOriginal,
            totalDiscountedPrice: totalDiscounted,
            totalDiscount: totalDisc
        };
    }, [orderItems]); // orderItems가 변경될 때만 totals 다시 계산

    // 주문 요약 생성 (useCallback을 사용하여 orderItems가 변경될 때만 실행)
    const getOrderSummary = useCallback(() => {
        if (orderItems.length === 0) return "주문 상품 0개";
        const firstItemName = orderItems[0].productName;
        const remainingCount = orderItems.length > 1 ? ` 외 ${orderItems.length - 1}건` : '';
        return `${firstItemName}${remainingCount}`;
    }, [orderItems]);

    // 토스페이 결제로 이동
    const goTossPay = async () => {
        if (orderItems.length === 0 || totals.totalDiscountedPrice <= 0) {
            alert("결제할 상품 정보가 올바르지 않습니다.");
            return;
        }
        try {
            // ⭐️ 1. 백엔드에 주문 생성 요청
            const requestData = {
                userId: 1, // ⭐ 실제 사용자 ID로 변경
                addressId: 1, // ⭐ 실제 배송지 ID로 변경
                orderName: getOrderSummary(), // 주문명
                totalAmount: totals.totalDiscountedPrice, // ⭐ 할인이 적용된 최종 결제 금액
                // ⭐ items 배열을 백엔드 OrderItemDTO 구조에 맞춰 변환 (잘들어옴)
                items: orderItems.map(item => ({
                    stockId: item.stockId,
                    quantity: item.quantity,
                    // 백엔드에서 필요한 가격은 할인 적용된 최종 가격입니다.
                    price: item.discountedProductPrice != null ? item.discountedProductPrice : item.productPrice,

                })),
            };

            console.log("백엔드로 보낼 주문 생성 요청 데이터:", requestData);

            const response = await api.post("/order/create", requestData);
            const { clientOrderId: clientOrderId } = response.data;

            // 2. 받은 orderId를 가지고 다음 페이지(check.page)로 이동
            navigate('/order/check', {
                state: {
                    totalAmount: totals.totalDiscountedPrice,
                    orderName: requestData.orderName,
                    clientOrderId: clientOrderId,
                },
            });

        } catch (error) {
            console.error("주문 생성 중 오류 발생:", error.response?.data || error.message);
            alert("주문을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
/*
        const queryString = new URLSearchParams({
            orderName: getOrderSummary(),
            totalAmount: totals.totalDiscountedPrice,
            // user 정보를 가져와서 추가합니다.
            customerName: "박세원", // 예시 유저 이름
        }).toString();

        navigate(`/order/check?${queryString}`, {
            state: {
                items: orderItems,
            },
        });*/
    };

    if (isLoading) return <div className="loading-message">로딩 중...</div>;
    if (error) return <div className="error-message">오류가 발생했습니다: {error}</div>;
    if (orderItems.length === 0) return <div className="no-items-message">주문할 상품이 없습니다.</div>;


    return (
        <div className="cart-page-layout">
            <div className="order-details-container">
                <h2 className="section-header">주문서</h2>
                <div className="order-section">
                    <div className="delivery-info-header">
                        <h3>박세원</h3> {/* 실제 사용자 이름으로 대체 필요 */}
                        <button className="change-address-btn">
                            배송지 변경
                        </button>
                    </div>
                    <p className="delivery-text">서울특별시 관악구</p> {/* 실제 배송지 정보로 대체 필요 */}
                    <p className="delivery-text">010-1234-5678</p> {/* 실제 연락처 정보로 대체 필요 */}
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
                    <div className="order-item" key={item.stockId}> {/* key를 item.id에서 item.stockId로 변경, 또는 productId와 조합하여 고유하게 */}
                        <img
                            src={`http://localhost:8080/image/${item.productImageId}`}
                            alt={item.productName}
                            className="product-image"/>
                        <div className="product-details">
                            <h4>{item.productName}</h4>
                            <p>{item.sellerBusinessName}</p>
                            <p>상세옵션: {item.productSize}, {item.productColor}</p>
                            <p>{item.quantity}개</p>
                            <div className="price-info">
                                {/* 할인가가 있으면 표시하고 없으면 원래 가격만 표시 */}
                                {item.discountedProductPrice != null && item.discountedProductPrice !== item.productPrice ? (
                                    <>
                                        <span className="original-price" style={{ textDecoration: 'line-through', color: '#888' }}>
                                            {item.productPrice.toLocaleString()}원
                                        </span>
                                        <span className="sale-price" style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                                            {item.discountedProductPrice.toLocaleString()}원
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span></span> {/*여백을 채우기 위함*/}
                                        <span className="sale-price" style={{ fontWeight: 'bold' }}>
                                        {item.productPrice.toLocaleString()}원
                                    </span>
                                    </>
                                )}
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
                    <span>(무료배송)</span> {/* 배송비 계산 로직 필요 시 추가 */}
                </div>
                <div className="price-item">
                    <span>상품할인</span>
                    <span>{totals.totalDiscount.toLocaleString()}원</span>
                </div>
                <div className="total-price">
                    <span>총 구매 금액</span>
                    <span>{totals.totalDiscountedPrice.toLocaleString()}원</span>
                </div>
                <button
                    onClick={goTossPay}
                    className="button"
                >
                    {getOrderSummary()} 결제하기
                </button>
            </div>
        </div>
    );
};

export default OrderFormPage;