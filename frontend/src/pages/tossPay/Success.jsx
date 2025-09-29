import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./Success.css";

export function SuccessPage() {
    const confirmingRef = useRef(false); // 중복 호출 막기
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { api } = useAuth();

    const [orderInfo, setOrderInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const requestData = {
            orderId: searchParams.get("orderId"),
            amount: searchParams.get("amount"),
            paymentKey: searchParams.get("paymentKey"),
        };

        async function confirm() {
            if (confirmingRef.current) return;
            confirmingRef.current = true;

            try {
                const response = await api.post("/confirm", requestData);
                setOrderInfo(response.data);
                console.log("서버 응답 성공 (장바구니 삭제 완료):", response.data);
            } catch (err) {
                console.error("결제 검증 오류:", err.response?.data || err.message);
                setError("결제 검증 중 오류가 발생했습니다.");
                navigate(`/fail?message=${encodeURIComponent(err.message)}`);
            }
        }

        if (requestData.orderId && requestData.amount && requestData.paymentKey) {
            confirm();
        }
    }, [api, navigate, searchParams]); // 의존성 정리

    if (error) return <div className="error-message">{error}</div>;
    if (!orderInfo) return <div className="loading-message">주문 확인 중...</div>;

    return (
        <div className="success-wrap">
            {/* 상단 배너 */}
            <div className="banner">주문 완료</div>

            {/* 배송 정보 (데이터가 있으면 표시) */}
            {(orderInfo.receiverName ||
                orderInfo.address ||
                orderInfo.phone ||
                (orderInfo.requestMsg && orderInfo.requestMsg.trim() !== "")) && (
                <section className="section">
                    <h3 className="section-title">배송 정보</h3>
                    <div className="ship-info">
                        {orderInfo.receiverName && (
                            <div className="ship-line">{orderInfo.receiverName}</div>
                        )}
                        {orderInfo.address && (
                            <div className="ship-line">{orderInfo.address}</div>
                        )}
                        {orderInfo.phone && (
                            <div className="ship-line">{orderInfo.phone}</div>
                        )}
                        {orderInfo.requestMsg && orderInfo.requestMsg.trim() !== "" && (
                            <div className="ship-line">요청사항: {orderInfo.requestMsg}</div>
                        )}
                    </div>
                </section>
            )}

            {/* 주문 상품 */}
            <section className="section">
                <h3 className="section-title">
                    주문 상품 {orderInfo.items?.length ?? 0}개
                </h3>

                {(orderInfo.items || []).filter(Boolean).map((item, idx) => {
                    const imageUrl = item.productImageId
                        ? `http://localhost:8080/image/${item.productImageId}`
                        : "/placeholder.png";

                    // 숫자로 안전 변환
                    const unitPrice = Number(item.price ?? 0);
                    const originalPrice = Number(
                        item.originalPrice != null ? item.originalPrice : unitPrice
                    );

                    const hasOriginal =
                        Number.isFinite(originalPrice) &&
                        Number.isFinite(unitPrice) &&
                        originalPrice > unitPrice;

                    return (
                        <div key={idx} className="item-card">
                            <div className="thumb">
                                <img src={imageUrl} alt={item.productName || "상품"} />
                            </div>
                            <div className="meta">
                                {item.brand && <div className="brand">{item.brand}</div>}
                                <div className="name">{item.productName || "상품"}</div>

                                {/* 옵션은 백엔드에서 아직 안 내려주니, 있으면만 표시 */}
                                {(item.size || item.color || item.option) && (
                                    <div className="option">
                                        {(item.size && `${item.size}`) ||
                                            (item.option && `${item.option}`)}
                                        {item.color && ` / ${item.color}`}
                                    </div>
                                )}

                                <div className="qty">{Number(item.quantity ?? 0)}개</div>

                                <div className="price-row">
                                    {hasOriginal && (
                                        <span className="original">
                      {originalPrice.toLocaleString()}원
                    </span>
                                    )}
                                    <span className="final">
                    {unitPrice.toLocaleString()}원
                  </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* 하단 총액/버튼 */}
            <section className="bottom-cta">
                <div className="total">
                    총 결제 금액{" "}
                    <strong>
                        {Number(orderInfo.totalAmount ?? 0).toLocaleString()}원
                    </strong>
                </div>
                <div className="btn-row">
                    <button
                        className="btn black"
                        onClick={() => navigate("/mypage")}
                    >
                        주문 내역 보러가기
                    </button>
                    <button className="btn blue" onClick={() => navigate("/")}>
                        메인으로
                    </button>
                </div>
            </section>
        </div>
    );
}
