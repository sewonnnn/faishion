import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext.jsx";

export function SuccessPage() {
    const confirmingRef = useRef(false); // ✅ 중복 호출 방지용
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [orderInfo, setOrderInfo] = useState(null);
    const [error, setError] = useState(null);
    const {api} = useAuth();
    // 요청 상태를 추적하는 상태
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        const requestData = {
            orderId: searchParams.get("orderId"),
            amount: searchParams.get("amount"),
            paymentKey: searchParams.get("paymentKey"),
        };

        console.log("서버로 보낼 요청 데이터:", requestData);

        async function confirm() {
            if (confirmingRef.current) return;  // ✅ 이미 진행 중이면 탈출
            confirmingRef.current = true;


            try {
                const response = await api.post("/confirm", requestData);
                setOrderInfo(response.data);
                console.log("서버 응답 성공:", response.data);
            } catch (err) {
                console.error("결제 검증 오류:", err.response?.data || err.message);
                setError("결제 검증 중 오류가 발생했습니다.");
                navigate(`/fail?message=${encodeURIComponent(err.message)}`);
            } finally {
                // 요청이 끝난 후 상태를 false로 변경
                setIsConfirming(false);
            }
        }

        // URL 파라미터가 모두 있는지 확인하고, 요청을 시작
        if (requestData.orderId && requestData.amount && requestData.paymentKey) {
            confirm();
        }
    }, []);

    if (error) return <div className="error-message">{error}</div>;
    if (!orderInfo) return <div className="loading-message">주문 확인 중...</div>;

    return (
        <div className="result wrapper">
            <div className="box_section">
                <h2>🎉 결제가 완료되었습니다!</h2>
                <p>주문번호: {orderInfo.orderId}</p>
                {/*<p>주문자: {orderInfo.customerName}</p>*/}
                <p>주문상품: {orderInfo.orderName}</p>
                <p>총 결제 금액: {Number(orderInfo.totalAmount).toLocaleString()}원</p>

                <h3>상품 목록</h3>
                <ul>
                    {orderInfo.items?.map((item, idx) => (
                        <li key={idx}>
                            {item.productName} ({item.quantity}개) -{" "}
                            {item.price.toLocaleString()}원
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}