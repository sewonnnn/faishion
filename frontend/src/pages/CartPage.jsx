import "./CartPage.css";
import {useNavigate} from "react-router-dom";
import useCart from '../hooks/useCart.js'; // 커스텀 훅 가져옴
import useCartSelection from "../hooks/useCartSelection.js";
import axios from "axios";
import {Button} from "react-bootstrap";
import React from "react";

const CartPage = () => {

    const navigate = useNavigate();

    // 1. 장바구니 데이터 및 가격 계산
    const {
        cartList,
        fetchCartData, // useCartSelection에서 호출하기 위해 추가
        totalOriginalPrice, // 할인 미포함 총 가격
        totalDiscountedPrice, // 할인 포함 총 가격
        totalDiscount, // 할인 가격
    } = useCart();

    // 2. 체크박스 선택 및 삭제
    const {
        selectedItems,
        isAllSelected,
        handleCheckboxChange,
        handleSelectAll,
        handleDelete,
        handleDeleteSelected,
    } = useCartSelection(cartList, fetchCartData);

    const goSelectedItemsOrder = async () => {

        try {
            if (selectedItems.length === 0) {
                alert("주문할 상품을 선택해주세요.");
                return;
            }

            const cartIds = selectedItems.join(",");
            console.log("선택된 상품들의 id들: " + cartIds);

            const res = await axios.get("http://localhost:8080/order/new", {
                params: { ids: cartIds },
            });
            res.data.map((item) => {console.log(item)});
            // 받은 데이터와 함께 페이지 이동*/
            navigate("/order/new", {
                state: { ids: cartIds }, // orderItems: res.data,
                replace: false,
            });
        } catch (e) {
            console.error("함수 실행 중 오류 발생:", e);
            alert("주문서 불러오기에 실패했습니다.");
        }
    };
    const onAIForm = async () => {
        // 선택된 상품이 없으면 경고창 띄우기
        if (selectedItems.length === 0) {
            alert("AI로 옷 입어보기를 할 상품을 선택해주세요.");
            return;
        }
        // 선택된 cartId들을 콤마로 연결
        const cartIds = selectedItems.join(",");
        try {
            // 백엔드 API 호출하여 선택된 상품들의 stockId 리스트를 가져옴
            const res = await axios.get("api/gemini/cart-stocks", {
                params: { ids: cartIds }
            });

            const stockIds = res.data.stockIds;

            // stockId 리스트를 URL 파라미터로 넘겨 AI 페이지로 이동
            navigate(`/gemini/try-on?stockIds=${stockIds}`);
        } catch (e) {
            console.error("AI로 옷 입어보기 실패:", e);
            alert("AI로 옷 입어보기에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 주문 상품 개수
    const getOrderSummary = () => {
        if (selectedItems.length === 0) return "주문 상품 0개";

        const totalItems = selectedItems.length;

        return `${totalItems}건`;
    };

    // 상품 상세로 이동
    const goProduct = (productId) => {
        console.log("상품 상세 이동 상품 id:" + productId)
        navigate(`/product/${productId}`);
    };

    return (
        <>
            <div className="cart-container">
                <div className="cart-main">
                    <div className="cart-header">
                        <div className="checkbox-group">
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                            <label htmlFor="selectAll">전체 선택</label>
                            <button type="button" onClick={handleDeleteSelected}>선택 삭제</button>
                        </div>
                    </div>

                    {/* 장바구니 상품 목록 */}
                    {cartList.map((item) => (
                        <div className="cart-item" key={item.id}>
                            <div className="item-details">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => handleCheckboxChange(item.id)}
                                />
                                <div className="item-image-wrap">
                                    <img
                                        src={`http://localhost:8080/image/${item.productImageId}`}
                                        alt={item.productName}
                                        className="product-image"
                                    />
                                </div>
                                <div className="item-info" onClick={() => goProduct(item.productId)} style={{ cursor: "pointer" }} >

                                    <h4>{item.sellerBusinessName}</h4>
                                    <p>{item.productName}</p>
                                    <p>상세옵션:  {item.productSize}, {item.productColor}</p>
                                    <p className="item-options">수량: {item.quantity}개 </p>
                                    <p className="item-price">{item.discountedProductPrice}원</p>
                                </div>
                            </div>
                            <div className="item-actions">
                                <button onClick={() => handleDelete(item.id)}>삭제</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 결제 정보 요약(결제 정보 리스트) */}
                <div className="price-summary-box">
                    <h3>결제 정보</h3>
                    <div className="price-item">
                        <span>상품금액</span>
                        <span>{totalOriginalPrice}원</span>
                    </div>
                    <div className="price-item">
                        <span>배송비</span>
                        <span>(무료배송)</span>
                    </div>
                    <div className="price-item">
                        <span>상품할인</span>
                        <span>{totalDiscount}원</span>
                    </div>
                    <div className="total-price">
                        <span>총 구매 금액</span>
                        <span>{totalDiscountedPrice}원</span>
                    </div>
                    <button className="order-btn" onClick={goSelectedItemsOrder}>{getOrderSummary()} 주문하기</button>
                    <Button variant="outline-dark" onClick={onAIForm}>
                        AI로 옷 입어보기
                    </Button>
                </div>
            </div>
        </>
    );
}

export default CartPage;