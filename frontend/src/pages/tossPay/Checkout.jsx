import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = generateRandomString();

export function CheckoutPage() {
    const location = useLocation();
    const { totalAmount, orderName, clientOrderId } = location.state || {};

    const [amount, setAmount] = useState({
        currency: "KRW",
        value: totalAmount ?? 0,
    });

    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);

    useEffect(() => {
        async function fetchPaymentWidgets() {
            const tossPayments = await loadTossPayments(clientKey);
            const widgets = tossPayments.widgets({
                customerKey,
            });
            setWidgets(widgets);
        }
        fetchPaymentWidgets();
    }, []);

    useEffect(() => {
        async function renderPaymentWidgets() {
            if (widgets == null) return;

            await widgets.setAmount(amount);

            await Promise.all([
                widgets.renderPaymentMethods({
                    selector: "#payment-method",
                    variantKey: "DEFAULT",
                }),
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
        if (widgets == null) return;
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
                        if (!clientOrderId) {
                            alert("주문 ID가 없습니다. 결제를 진행할 수 없습니다.");
                            return;
                        }
                        await widgets.requestPayment({
                            orderId: String(clientOrderId),   // 무조건 서버에서 받은 clientOrderId 사용
                            orderName: String(orderName || "주문상품"),
                            successUrl: `${window.location.origin}/success`,
                            failUrl: `${window.location.origin}/fail`,
                        });
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
