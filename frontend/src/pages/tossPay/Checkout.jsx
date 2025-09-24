import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";


const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey =  generateRandomString();

export function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // URL 파라미터에서 데이터 추출
    const totalAmount = Number(searchParams.get('totalAmount'));
    const orderName = searchParams.get('orderName');
    const customerName = searchParams.get('customerName');

    // location.state에서 데이터 추출
    const { items } = location.state || { items: [] };
    const [amount, setAmount] = useState({
        currency: "KRW",
        value: totalAmount, //서치파람으로 받기
    });
    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);


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
    }, [widgets]);

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
                                orderId: "O3T-yz4BJ5S1nYiy54TPp",
                                orderName: orderName,
                                successUrl: window.location.origin + "/success", // get 방식으로
                                failUrl: window.location.origin + "/fail",
                                customerEmail: "customer123@gmail.com",
                                customerName: customerName,
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

function generateRandomString() {
    return window.btoa(Math.random().toString()).slice(0, 20);
}