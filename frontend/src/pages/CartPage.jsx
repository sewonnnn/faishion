import "./CartPage.css";
import {useNavigate} from "react-router-dom";
import useCart from '../hooks/useCart.js'; // 커스텀 훅 가져옴
import useCartSelection from "../hooks/useCartSelection.js";

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

    // 선택된 상품들만 주문정보 페이지로 이동
    const goSelectedItemsOrder = () => {
        if (selectedItems.length === 0) {
            alert("주문할 상품을 선택해주세요.");
            return;
        }

        // 선택된 상품들의 cartId를 쉼표로 구분하여 URL 파라미터로 전달
        const cartIds = selectedItems.join(',');
        navigate(`/order/new?ids=${cartIds}`);
    };

    //
    // // 주문정보 페이지 이동
    // const goOrder= (cartId)=>{
    //      navigate(`/order/new/${cartId}`);
    // }

    // 주문 상품 개수
    const getOrderSummary = () => {
        if (cartList.length === 0) return "주문 상품 0개";
        const totalItems = cartList.length;
        return `${totalItems}건`;
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
                                <div className="item-info">
                                    <h4>{item.productName}</h4>
                                    <p>{item.sellerBusinessName}</p>
                                    <p>상세옵션:  {item.productSize}, {item.productColor}</p>
                                    <p className="item-options">{item.quantity}개 </p>
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
                </div>
            </div>
        </>
    );
}

export default CartPage;