import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
// 모듈 임포트 연동방식
// ------  SDK 초기화 ------
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_ck_26DlbXAaV0dDP5p5QzG0VqY50Q9R";
const customerKey = "uEhWQpQoz9KXGFHoXQSjI";


export function PaymentCheckoutPage({ totalAmount, orderName }) { // ✨ props로 데이터 받기
    const [payment, setPayment] = useState(null);

    useEffect(() => {
        async function fetchPayment() {
            try {
                const tossPayments = await loadTossPayments(clientKey);
                // 회원 결제
                // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentspayment
                const payment = tossPayments.payment({
                    customerKey,
                });
                // 비회원 결제
                // const payment = tossPayments.payment({ customerKey: ANONYMOUS });
                setPayment(payment);
            } catch (error) {
                console.error("Error fetching payment:", error);
            }
        }
        fetchPayment();
    }, [clientKey, customerKey]);

    // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
    // @docs https://docs.tosspayments.com/sdk/v2/js#paymentrequestpayment
    async function requestPayment() {
        // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
        // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
        await payment.requestPayment({
            method: "CARD", // 카드 및 간편결제
            amount: {
                currency: "KRW",
                value: totalAmount,
            },
            orderId: "7PE4GryRzWy6jA_cI5Wyc", // 고유 주문번호
            orderName: orderName,
            successUrl: window.location.origin + "/success", // 결제 요청이 성공하면 리다이렉트되는 URL
            failUrl: window.location.origin + "/fail", // 결제 요청이 실패하면 리다이렉트되는 URL
            customerEmail: "customer123@gmail.com",
            customerName: "김토스",
            customerMobilePhone: "01012341234",
            // 카드 결제에 필요한 정보
            card: {
                useEscrow: false,
                flowMode: "DEFAULT", // 통합결제창 여는 옵션
                useCardPoint: false,
                useAppCardOnly: false,
            },
        });
    }
    return (
        // 결제하기 버튼
        <button className="order-btn" onClick={() => requestPayment()}>
            결제하기
        </button>
    );
}