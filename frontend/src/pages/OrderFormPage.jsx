// import './OrderFormPage.css';
// import useCart from '../hooks/useCart.js'; // 커스텀 훅 가져옴
// import useTosspay from '../hooks/useTosspay.js';
// import {useEffect} from "react";
//
// const OrderFormPage = () => {
//     // 커스텀 훅을 사용하여 장바구니 데이터와 함수를 가져옴.
//     const {
//         cartList,
//         totalOriginalPrice,
//         totalDiscountedPrice,
//         totalDiscount,
//     } = useCart();
//
//
//     // 커스텀 훅 사용a
//     const { requestPayment,
//         setPaymentInfo,
//         isLoading,
//         error
//     } = useTosspay();
//
//     // 장바구니 데이터가 변경될 때마다 결제 데이터 설정
//     useEffect(() => {
//         if (totalDiscountedPrice > 0) { // 0원 이상일 때만 설정
//             setPaymentInfo({
//                 amount: {
//                     currency: "KRW",
//                     value: totalDiscountedPrice
//                 },
//                 orderId: "7PE4GryRzWy6jA_cI5Wyc", // 고유 주문번호
//                 orderName: `주문 상품 ${cartList.length}건`, // 주문명
//             });
//         }
//     }, [totalDiscountedPrice, cartList.length, setPaymentInfo]);
//
//     // 주문 상품 개수
//     const getOrderSummary = () => {
//         if (cartList.length === 0) return "주문 상품 0개";
//         const totalItems = cartList.length;
//             return `${totalItems}건`;
//     };
//
//     return (
//         <div className="cart-page-layout">
//             <div className="order-details-container">
//                 <h2 className="section-header">주문서</h2>
//                 <div className="order-section">
//                     <div className="delivery-info-header">
//                         <h3>박세원</h3>
//                         <button className="change-address-btn">
//                             배송지 변경
//                         </button>
//                     </div>
//                     <p className="delivery-text">서울특별시 관악구</p>
//                     <p className="delivery-text">010-1234-5678</p>
//                     <select className="delivery-select">
//                         <option>직접 수령</option>
//                         <option>문 앞에 놔주세요</option>
//                         <option>문 앞에 두고 벨 눌러주세요</option>
//                         <option>경비실에 맡겨주세요</option>
//                     </select>
//                 </div>
//
//                 <hr className="divider" />
//                 <h2 className="section-header">주문 상품 {cartList.length}개</h2>
//                 {cartList.map((item) => (
//                     <div className="order-item" key={item.id}>
//                         <img
//                             src={`http://localhost:8080/image/${item.productImageId}`}
//                             alt={item.productName}
//                             className="product-image"
//                         />
//                         <div className="product-details">
//                             <h4>{item.productName}</h4>
//                             <p>{item.sellerBusinessName}</p>
//                             <p>상세옵션:  {item.productSize}, {item.productColor}</p>
//                             <p>{item.quantity}개</p>
//                             <div className="price-info">
//                                 <span className="original-price">{item.productPrice}원</span>
//                                 <span className="sale-price">{item.discountedProductPrice}원</span>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             {/* 결제 정보 */}
//             <div className="price-summary-box">
//                 <h3 className="section-header">결제 정보</h3>
//                 <div className="price-item">
//                     <span>상품금액</span>
//                     <span>{totalOriginalPrice}원</span>
//                 </div>
//                 <div className="price-item">
//                     <span>배송비</span>
//                     <span>(무료배송)</span>
//                 </div>
//                 <div className="price-item">
//                     <span>상품할인</span>
//                     <span>{totalDiscount}원</span>
//                 </div>
//                 <div className="total-price">
//                     <span>총 구매 금액</span>
//                     <span>{totalDiscountedPrice}</span>
//                 </div>
//                 <button
//                     className="order-btn"
//                     // 로딩 중이거나 에러 발생 시 버튼 비활성화
//                     disabled={isLoading || error}
//                     onClick={() => requestPayment()}
//                 >
//                     {isLoading ? "결제 준비 중..." : `${getOrderSummary()} 결제하기`}
//                 </button>
//             </div>
//         </div>
//     );
// };
//
// export default OrderFormPage;