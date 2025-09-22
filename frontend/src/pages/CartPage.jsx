import React, {useEffect, useState} from "react";
import "./CartPage.css";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const CartPage = () => {

    const [cartList, setCartList] = useState([]); // 보여지는 장바구니 리스트
    const navigate = useNavigate();

    // 장바구니 데이터 불러오는 함수
    const fetchCartData = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8080/cart/list'
            );
            console.log(response.data);
            setCartList(response.data);
        } catch (error) {
            console.error("장바구니데이터를 가져오는 중 오류 발생:", error);
            setCartList([]);
        }
    };

    useEffect(() => {
        fetchCartData();
    }, []);

    // 주문정보 페이지 이동
    const goOrder= (id)=>{
         navigate(`/order/new/${id}`);
    }

    return (
        <>
        <div className="cart-container">
            <div className="cart-main">
                <div className="cart-header">
                    <div className="checkbox-group">
                        <input type="checkbox" id="selectAll" />
                        <label htmlFor="selectAll">전체 선택</label>
                        <button type="button">선택 삭제</button>
                    </div>
                </div>

                {/* 장바구니 상품 목록 */}
                {cartList.map((item) => (
                    <div className="cart-item" key={item.id}>
                        <button className="close-btn" type="button">×</button>
                        <div className="item-details">
                            <input type="checkbox" />
                            <div className="item-image-wrap">
                                {/*<img src={item.image} alt={item.title} className="item-image" />*/}
                            </div>
                            <div className="item-info">
                                <h4 className="item-title">{item.stock}</h4>
                                <p className="item-options">{item.quantity}개</p>
                                {/*<p className="item-price">{item.product.getPrice}원</p>*/}
                            </div>
                        </div>
                        <div className="item-actions">
                            <button>옵션/수량 변경</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 결제 정보 요약(결제 정보 리스트) */}
            <div className="price-summary-box">
                <h3>결제 정보</h3>
                <div className="price-item">
                    <span>상품금액</span>
                    <span>(가격)원</span>
                </div>
                <div className="price-item">
                    <span>배송비</span>
                    <span>(무료배송)</span>
                </div>
                <div className="price-item">
                    <span>상품할인</span>
                    <span>0원</span>
                </div>
                <div className="total-price">
                    <span>총 구매 금액</span>
                    <span>(가격)원</span>
                </div>
                <button className="order-btn"onClick={() => goOrder(1)}>2건 주문하기</button>
            </div>
        </div>
</>
    );
}

export default CartPage;