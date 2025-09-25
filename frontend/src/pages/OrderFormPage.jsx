import './OrderFormPage.css';
import {useEffect, useState, useMemo, useCallback} from "react";
import {useLocation, useNavigate} from "react-router-dom"
import {useAuth} from "../contexts/AuthContext.jsx";

const OrderFormPage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { api } = useAuth();

    useEffect(() => {
        const fetchAllData = async () => {
            // ⭐ 로딩 시작
            setIsLoading(true);
            setError(null);

            // 사용자 정보가 없으면 에러 처리
            // if (!user || !user.id) {
            //     setError("사용자 정보가 없어 주문을 진행할 수 없습니다. 다시 로그인해주세요.");
            //     setIsLoading(false);
            //     return;
            // }

            try {
                // 1. 사용자 상세 정보 조회
                const userResponse = await api.get('/user/');
                setUserProfile(userResponse.data);
                console.log('불러온 사용자 프로필:', userResponse.data);

                // 2. 주문할 상품 ID 확인
                const { ids } = location.state || {};
                if (!ids || ids.length === 0) {
                    setError("주문할 상품 ID가 없습니다.");
                    setIsLoading(false);
                    return;
                }

                // 3. 주문 상품 정보 조회
                const orderItemsResponse = await api.get(`/order/new?ids=${ids}`);
                setOrderItems(orderItemsResponse.data);

                // 모든 데이터 로딩이 성공적으로 완료되면 isLoading을 false로 설정합니다.
                setIsLoading(false);
            } catch (err) {
                console.error("데이터 로딩 중 오류 발생:", err.response?.data || err.message);
                setError("데이터를 불러오는 데 실패했습니다.");
                // 에러가 발생해도 로딩 상태는 종료합니다.
                setIsLoading(false);
            }
        };


            fetchAllData();

    }, [location.state, api]); // location.state와 user, api 객체에 의존합니다.


    // 총 가격 계산
    const totals = useMemo(() => {
        let totalOriginal = 0;
        let totalDiscounted = 0;
        let totalDisc = 0;

        orderItems.forEach(item => {
            totalOriginal += item.productPrice * item.quantity;
            const priceToUse = item.discountedProductPrice != null ? item.discountedProductPrice : item.productPrice;
            totalDiscounted += priceToUse * item.quantity;
            totalDisc += (item.productPrice - priceToUse) * item.quantity;
        });

        return {
            totalOriginalPrice: totalOriginal,
            totalDiscountedPrice: totalDiscounted,
            totalDiscount: totalDisc
        };
    }, [orderItems]);

    // 주문 요약 생성
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

        if (!userProfile || !userProfile.id ) {
            alert("사용자 정보가 아직 로딩되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        try {
            const requestData = {
                userId: userProfile.id,
                addressId: userProfile.addressId,
                orderName: getOrderSummary(),
                totalAmount: totals.totalDiscountedPrice,
                items: orderItems.map(item => ({
                    stockId: item.stockId,
                    quantity: item.quantity,
                    price: item.discountedProductPrice != null ? item.discountedProductPrice : item.productPrice,
                })),
            };


            console.log("백엔드로 보낼 주문 생성 요청 데이터:", requestData);

            const response = await api.post("/order/create", requestData);
            const { clientOrderId } = response.data;

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
    };


    // ⭐ 로딩 및 에러 상태 처리
    if (isLoading) {
        return <div className="loading-message">로딩 중...</div>;
    }

    if (error) {
        return <div className="error-message">오류가 발생했습니다: {error}</div>;
    }

    // 주문할 상품이 없을 때 메시지
    if (orderItems.length === 0) {
        return <div className="no-items-message">주문할 상품이 없습니다.</div>;
    }

    return (
        <div className="cart-page-layout">
            <div className="order-details-container">
                <h2 className="section-header">주문서</h2>
                <div className="order-section">
                    <div className="delivery-info-header">
                        <h3>{userProfile?.name || "사용자 이름"}</h3>
                        <button className="change-address-btn">
                            배송지 변경
                        </button>
                    </div>
                    <p className="delivery-text">{userProfile?.street || "배송지 정보"}</p>
                    <p className="delivery-text">{userProfile?.phoneNumber
                         || "연락처 정보"}</p>
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
                    <div className="order-item" key={item.stockId}>
                        <img
                            src={`http://localhost:8080/image/${item.productImageId}`}
                            alt={item.productName}
                            className="product-image"/>
                        <div className="product-details">
                            <h4>{item.sellerBusinessName}</h4>
                            <p>{item.productName}</p>
                            <p>상세옵션: {item.productSize}, {item.productColor}</p>
                            <p>{item.quantity}개</p>
                            <div className="price-info">
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
                                        <span></span>
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