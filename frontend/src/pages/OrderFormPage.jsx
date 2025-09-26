import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import PostcodeSearch from './customer/PostcodeSearch.jsx';

const OrderFormPage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { api } = useAuth();

    const [deliveryAddress, setDeliveryAddress] = useState({
        zipcode: '', //우편번호
        street: '',  //주소
        detail: '',  // 상세 주소
        requestMsg: '',
        isDefault: false,
    });
    const [isAddressEditing, setIsAddressEditing] = useState(false);

    const handleAddressSelect = (addressData) => {
        setDeliveryAddress(prev => ({
            ...prev,
            zipcode: addressData.zipcode,
            street: addressData.street,
        }));
    };

    const handleDetailChange = (e) => {
        setDeliveryAddress(prev => ({
            ...prev,
            detail: e.target.value,
        }));
    };

    const handleEditToggle = () => {
        setIsAddressEditing(prev => !prev);
    };

    // const handleRequestMsgChange = (e) => {
    //     setDeliveryAddress(prev => ({ ...prev, requestMsg: e.target.value }));
    // };

    const handleAddressSave = async () => {
        // 1) 모든 필드가 채워졌는지 확인
        if (!deliveryAddress.zipcode || !deliveryAddress.street || !deliveryAddress.detail) {
            alert("우편번호/주소/상세주소를 모두 입력해주세요.");
            return;
        }

        // 2) 사용자에게 저장 여부 확인
        const ok = window.confirm("이 배송지를 내 주소록에 저장할까요? (기본배송지로 설정하지는 않습니다)");
        if (!ok) {
            // 저장하지 않고 화면만 접기
            setIsAddressEditing(false);
            return;
        }

        try {
            // 3) 서버에 저장 요청 (isDefault=false)
            const payload = {
                zipcode: deliveryAddress.zipcode,
                street: deliveryAddress.street,
                detail: deliveryAddress.detail,
               // requestMsg: deliveryAddress.requestMsg, // requestMsg 추가
                isDefault: false, // 0과 동일 (DB에 false로 저장)

            };

            const res = await api.post("/address", payload);

            // 서버가 생성된 address의 id를 돌려준다고 가정
            const newAddressId = res.data?.id;

            // 4) 사용자 프로필의 주소 목록 동기화(선택)
            //    - /user/ 를 다시 불러와도 되고, 간단히 local 상태에만 추가해도 OK
            //    여기선 간단히 userProfile만 보강
            setUserProfile(prev => ({
                ...prev,
                addressId: newAddressId ?? prev?.addressId, // 필요 시 보강
                // 화면 출력용으로 현재 입력값 유지
                zipcode: deliveryAddress.zipcode,
                street: deliveryAddress.street,
                detail: deliveryAddress.detail,
            }));

            alert("주소가 저장되었습니다. (기본배송지 아님)");
            setIsAddressEditing(false);
        } catch (e) {
            console.error("주소 저장 실패:", e.response?.data || e.message);
            alert("주소 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const userResponse = await api.get('/user/');
                const userData = userResponse.data;
                setUserProfile(userData);

                //사용자 프로필에서 초기 배송지 상태 설정 확인
                setDeliveryAddress({
                    zipcode: userData.zipcode || '',
                    street: userData.street || '',
                    detail: userData.detail || '',
                    //requestMsg: userData.requestMsg || '',
                });

                const { ids } = location.state || {};
                if (!ids || ids.length === 0) {
                    setError("주문할 상품 ID가 없습니다.");
                    setIsLoading(false);
                    return;
                }

                const orderItemsResponse = await api.get(`/order/new?ids=${ids}`);
                setOrderItems(orderItemsResponse.data);
                setIsLoading(false);
            } catch (err) {
                console.error("데이터 로딩 중 오류 발생:", err.response?.data || err.message);
                setError("데이터를 불러오는 데 실패했습니다.");
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [location.state, api]);


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

    const getOrderSummary = useCallback(() => {
        if (orderItems.length === 0) return "주문 상품 0개";
        const firstItemName = orderItems[0].productName;
        const remainingCount = orderItems.length > 1 ? ` 외 ${orderItems.length - 1}건` : '';
        return `${firstItemName}${remainingCount}`;
    }, [orderItems]);

    const goTossPay = async () => {
        // [디버깅] 결제 요청 전 최종 배송지 상태 확인
        if (orderItems.length === 0 || totals.totalDiscountedPrice <= 0) {
            alert("결제할 상품 정보가 올바르지 않습니다.");
            return;
        }
        if (!userProfile || !userProfile.id ) {
            alert("사용자 정보가 아직 로딩되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        if (!deliveryAddress.zipcode || !deliveryAddress.street || !deliveryAddress.detail) {
            alert("배송지 정보를 모두 입력해주세요.");
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
            };
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

    if (isLoading) {
        return <div className="loading-message">로딩 중...</div>;
    }
    if (error) {
        return <div className="error-message">오류가 발생했습니다: {error}</div>;
    }
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
                        <button className="change-address-btn" onClick={handleEditToggle}>
                            {isAddressEditing ? '닫기' : '배송지 변경'}
                        </button>
                    </div>

                    {isAddressEditing ? (
                        <Card className="mb-3">
                            <Card.Body>
                                <Card.Title>배송지 변경</Card.Title>
                                <Form>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="3">우편번호</Form.Label>
                                        <Col sm="9">
                                            <PostcodeSearch
                                                onAddressSelect={handleAddressSelect}
                                                postcode={deliveryAddress.zipcode ?? ""}   //  controlled 보장
                                                baseAddress={deliveryAddress.street ?? ""} //  controlled 보장
                                            />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3">
                                        <Form.Label column sm="3">상세 주소</Form.Label>
                                        <Col sm="9">
                                            <Form.Control
                                                type="text"
                                                name="detail"
                                                value={deliveryAddress.detail ?? ""}       //  controlled 보장
                                                onChange={handleDetailChange}
                                                placeholder="상세 주소를 입력하세요"
                                            />
                                        </Col>
                                    </Form.Group>

                                    {/* 저장/취소 버튼 */}
                                    <div className="d-flex gap-2">
                                        <Button variant="primary" type="button" onClick={handleAddressSave}>
                                            주소 저장
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            type="button"
                                            onClick={() => setIsAddressEditing(false)}
                                        >
                                            취소
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="delivery-display">
                            <p className="delivery-text">{`(${deliveryAddress.zipcode ?? ""}) ${deliveryAddress.street ?? ""}`}</p>
                            <p className="delivery-text">{deliveryAddress.detail ?? ""}</p>
                        </div>
                    )}


                    <p className="delivery-text">연락처: {userProfile?.phoneNumber || "연락처 정보"}</p>

                    <select
                        className="delivery-select" >
                        {/* value={deliveryAddress.requestMsg}        //  state와 연결*/}
                        {/* onChange={(e) =>*/}
                        {/*     setDeliveryAddress((prev) => ({ ...prev, requestMsg: e.target.value }))*/}
                        {/* }*/}

                        <option value="">요청사항을 선택하세요</option>
                        <option value="직접 수령">직접 수령</option>
                        <option value="문 앞에 놔주세요">문 앞에 놔주세요</option>
                        <option value="문 앞에 두고 벨 눌러주세요">문 앞에 두고 벨 눌러주세요</option>
                        <option value="경비실에 맡겨주세요">경비실에 맡겨주세요</option>
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
