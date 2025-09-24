// import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
// import {useCallback, useEffect, useState} from "react";
//
// const clientKey = "test_ck_26DlbXAaV0dDP5p5QzG0VqY50Q9R";
// const customerKey = "uEhWQpQoz9KXGFHoXQSjI";
//
// const useTosspay = () => {
//     const [payment, setPayment] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//
//     // 결제 데이터를 상태로 관리
//     const [paymentData, setPaymentData] = useState({
//         amount: null,
//         orderId: null,
//         orderName: null
//     });
//
//     useEffect(() => {
//         async function initializePaymentSDK() {
//             try {
//                 const tossPayments = await loadTossPayments(clientKey);
//                 const paymentInstance = tossPayments.payment({ customerKey });
//                 setPayment(paymentInstance);
//             } catch (err) {
//                 setError(err);
//                 console.error("토스페이먼츠 SDK 초기화 실패:", err);
//             } finally {
//                 setIsLoading(false);
//             }
//         }
//         initializePaymentSDK();
//     }, []);
//
//     // 인자 없이 호출 가능한 결제 요청 함수
//     const requestPayment = async () => {
//         if (!payment || !paymentData.amount) {
//             console.error("결제 객체 또는 결제 데이터가 준비되지 않았습니다.");
//             return;
//         }
//
//         try {
//             await payment.requestPayment({
//                 method: "CARD",
//                 amount: paymentData.amount,
//                 orderId: paymentData.orderId,
//                 orderName: paymentData.orderName,
//                 successUrl: window.location.origin + "/order/complete",
//                 failUrl: window.location.origin + "/order/new",
//                 customerEmail: "customer123@gmail.com",
//                 customerName: "김토스",
//                 customerMobilePhone: "01012341234",
//                 card: {
//                     useEscrow: false,
//                     flowMode: "DEFAULT",
//                     useCardPoint: false,
//                     useAppCardOnly: false,
//                 },
//             });
//         } catch (err) {
//             console.error("결제 요청 실패:", err);
//             if (err.code === 'PAY_PROCESS_CANCELED') {
//                 alert('결제가 취소되었습니다. 다시 시도해주세요.');
//             } else {
//                 alert(`결제 실패: ${err.message}`);
//             }
//         }
//     };
//
//     // 결제 데이터를 업데이트하는 함수
//     // useCallback으로 감싸기 필수 (무한 로딩)
//     const setPaymentInfo = useCallback((info) => {
//         setPaymentData(info);
//     }, []); // 이 함수가 변경되지 않으므로 의존성 배열은 비워둠
//
//     // 훅을 사용하는 컴포넌트에게 필요한 상태와 함수를 반환
//     return {
//         requestPayment,
//         setPaymentInfo, // 데이터 설정 함수 추가
//         isLoading,
//         error
//     };
// };
//
// export default useTosspay;
