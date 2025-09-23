import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import {useLocation, useNavigate} from "react-router-dom";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "jD3D0fmD4Lu41F70aKXAR";

export function PaymentCheckoutPage() {

    // 1. useLocation을 사용하여 이전 페이지의 state 데이터 가져오기
    const location = useLocation();
    const navigate = useNavigate(); // 잘못된 접근 시 리다이렉트를 위해 추가

    // 가져온 데이터를 구조 분해 할당. 데이터가 없을 경우를 대비해 기본값 설정
    const { totalAmount, orderName, orderId } = location.state || {
        totalAmount: 0,
        orderName: "상품",
        orderId: ""
    };

    // 2. amount 상태의 초기값을 동적으로 받아온 totalAmount로 설정
    const [amount, setAmount] = useState({
        currency: "KRW",
        value: totalAmount,
    });


    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);

    // 잘못된 접근(state 없이 URL로 직접 접근) 방지
    useEffect(() => {
        if (totalAmount <= 0 || !orderId) {
            alert("잘못된 접근입니다. 다시 주문을 시도해주세요.");
            navigate('/');
        }
    }, [totalAmount, orderId, navigate]);



    useEffect(() => {
        async function fetchPaymentWidgets() {
            // ------  결제위젯 초기화 ------
            const tossPayments = await loadTossPayments(clientKey);
            // 회원 결제
            const widgets = tossPayments.widgets({
                customerKey,
            });
            // 비회원 결제
            // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

            setWidgets(widgets);
        }

        fetchPaymentWidgets();
    }, [clientKey, customerKey]);

    useEffect(() => {
        async function renderPaymentWidgets() {
            if (widgets == null) {
                return;
            }
            // ------ 주문의 결제 금액 설정 ------
            await widgets.setAmount(amount);

            await Promise.all([
                // ------  결제 UI 렌더링 ------
                widgets.renderPaymentMethods({
                    selector: "#payment-method",
                    variantKey: "DEFAULT",
                }),
                // ------  이용약관 UI 렌더링 ------
                widgets.renderAgreement({
                    selector: "#agreement",
                    variantKey: "AGREEMENT",
                }),
            ]);

            setReady(true);
        }

        renderPaymentWidgets();
    }, [widgets,amount]);

    useEffect(() => {
        if (widgets == null) {
            return;
        }

        widgets.setAmount(amount);
    }, [widgets, amount]);

    return (
        <div className="wrapper">
            <div className="box_section">
                {/* 결제 UI */}
                <div id="payment-method" />
                {/* 이용약관 UI */}
                <div id="agreement" />

                {/* 결제하기 버튼 */}
                <button
                    className="button"
                    disabled={!ready}
                    onClick={async () => {
                        try {
                            // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
                            // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
                            // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
                            await widgets.requestPayment({
                                orderId: orderId,
                                orderName: orderName,
                                successUrl: window.location.origin + "/success",
                                failUrl: window.location.origin + "/fail",
                                customerEmail: "customer123@gmail.com",
                                customerName: "박세원",
                                customerMobilePhone: "01012341234",
                            });
                        } catch (error) {
                            // 에러 처리하기
                            console.error(error);
                        }
                    }}
                >
                    결제하기
                </button>
            </div>
        </div>
    );
}