import React, {useEffect, useState} from "react";
import "./MyPage.css";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const MyPage = () => {
    const [cartList, setCartList] = useState([]); // 보여지는 장바구니 리스트
    const nav = useNavigate();
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

    const onDetailPage = () =>{
        nav("/mypage/detail");
    }
    return (
        <div className="mypage-container">
            {/* 상단 프로필 영역(로그인한 회원 데이터 받아서 뿌리기) */}
            <section className="profile-section">
                <div className="profile-info">
                    <img
                        src="https://i.pinimg.com/736x/b8/28/79/b828797de30b15089a5b9d76772d4bc8.jpg"
                        alt="프로필"
                        className="profile-avatar"
                    />
                    <div>
                        <p className="profile-name">나는야 유부미</p>
                        <p className="profile-desc">
                            이번 달 안에 <span className="highlight">328,348점</span> 더
                            쌓아야 등급이 유지돼요
                        </p>
                    </div>
                </div>
                <button className="settings-btn" onClick={onDetailPage}>⚙️</button>
            </section>

            {/* 적립금, 등급, 쿠폰 */}
            <section className="status-section">
                <div className="status-box">
                    <p className="status-label">배송현황</p>
                    <p className="status-value">1,195원</p>
                </div>
                <div className="status-box">
                    <p className="status-label">나의 등급</p>
                    {/*동적 등급 넣기*/}
                    <p className="status-value">LV.3 패션링</p>
                </div>
                <div className="status-box">
                    <p className="status-label">쿠폰</p>
                    {/*동적 쿠폰 넣기*/}
                    <p className="status-value">2장</p>
                </div>
            </section>

            {/* 주문 내역 */}
            <section className="order-section">
                <h2 className="section-title">주문 내역</h2>
                <div className="order-list">
                    {/*추후 주문 내역 담겨있는 리스트로 사용*/}
                    {cartList.map((item) => (
                        <div key={item} className="order-item">
                            <img
                                 alt="키코지러브 앤 재즈 캡_블루 상품 이미지"
                                 src=""
                                 className="order-thumb"/>
                            <div className="order-info">
                                <p className="order-brand">(상품명)</p>
                                <p className="order-desc">
                                    판매자 점포명</p>
                                <p className="order-meta">105 / {item.quantity}개</p>
                                <p className="order-price-original">559,000원</p>
                                <p className="order-price-sale">335,000원</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default MyPage;

