import React from "react";
import "./MyPage.css";

const MyPage = () => {
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
                <button className="settings-btn">⚙️</button>
            </section>

            {/* 적립금, 등급, 쿠폰 */}
            <section className="status-section">
                <div className="status-box">
                    <p className="status-label">적립금</p>
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
                    {[1, 2, 3, 4].map((p) => (
                        <div key={p} className="order-item">
                            <img
                                src="https://image.msscdn.net/thumbnails/images/goods_img/20250528/5151434/5151434_17562621557732_big.jpg?w=1200" class="sc-uxvjgl-8 hlFFlu"
                                alt="상품"
                                className="order-thumb"
                            />
                            <div className="order-info">
                                <p className="order-brand">컬럼비아</p>
                                <p className="order-desc">
                                    여성 패스 디씨 포레스트 다운 자켓 C54YL3483010
                                </p>
                                <p className="order-meta">105 / 1개</p>
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

