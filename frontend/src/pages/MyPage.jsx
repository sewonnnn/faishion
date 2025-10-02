import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
// 부트스트랩 컴포넌트 임포트
import { Container, Row, Col, Button, Image as BootstrapImage, Spinner } from "react-bootstrap";
import defaultImage from "../assets/user.jpg";
import { useAuth } from "../contexts/AuthContext.jsx";
import { FaCog } from "react-icons/fa";

// 금액을 쉼표 형식으로 포맷하는 헬퍼 함수
const formatPrice = (price) => {
    // price가 유효한 숫자인지 확인
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    return validPrice.toLocaleString('ko-KR');
};

const MyPage = () => {
    const [orderList, setOrderList] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태는 true로 시작

    const nav = useNavigate();
    const { api } = useAuth();

    // 회원이 쓴 리뷰 보기 페이지 이동
    const onReviewListForm = () =>{
        nav("/mypage/review");
        }
    // API의 기본 URL을 사용하여 이미지 URL을 생성하는 헬퍼 함수
    const getImageUrl = (imageId) => {
        return imageId ? `${api.defaults.baseURL}/image/${imageId}` : defaultImage;
    };

    // 회원 정보 불러오는 함수
    const fetchUserData = async () => {
        try {
            const response = await api.get(`/user/`);
            const userData = response.data;

            // ⭐️ null 체크 및 API 응답을 기반으로 상태 설정
            setUserProfile(userData);

            // 이미지 불러오기
            if (userData.image && userData.image.id) {
                setImagePreviewUrl(getImageUrl(userData.image.id));
            } else {
                setImagePreviewUrl(defaultImage);
            }
            return userData; // Promise.all을 위해 userData 반환
        } catch (error) {
            console.error('Error fetching user data:', error);
            // 오류 시 기본값 또는 오류 처리
            setUserProfile({});
            setImagePreviewUrl(defaultImage);
            return {};
        }
    };

    // 주문 내역 데이터 불러오는 함수
    const fetchOrderData = async () => {
        try {
            const response = await api.get(`/order/my-history`);
            setOrderList(response.data);
        } catch (error) {
            console.error('Error fetching order data:', error);
            setOrderList([]); // 오류 시 빈 배열로 설정
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                // 사용자 정보와 주문 정보를 병렬로 로드
                await Promise.all([
                    fetchUserData(),
                    fetchOrderData()
                ]);
            } catch (error) {
                console.error("Critical error during initial data fetch:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [api]); // api 의존성 추가 (useAuth가 변경될 때 재실행)

    const onDetailPage = () => {
        nav("/mypage/detail"); // 설정 페이지로 이동
    }

    // 선택한 상품 주문 정보 페이지로 이동
    const onOrderDetail = (orderId) => {
        nav(`/order/${orderId}`);
    }

    if (isLoading || userProfile === null) {
        return (
            <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    const profile = userProfile || {};
    const userName = profile.name || '이름 없음';

    return (
        <div className="min-vh-100 d-flex justify-content-center">
            <Container className="p-0 bg-white" style={{ maxWidth: '768px'}}>
                <header className="d-flex justify-content-between align-items-center py-3 px-3 border-botto">
                    <h3 className="fs-4 fw-bold mb-0">마이페이지</h3>
                    <div className="d-flex">
                        <Button variant="link" className="text-dark p-0 icon-btn-custom" onClick={onDetailPage}>
                            <FaCog size={24} />
                        </Button>
                    </div>
                </header>

                {/* 2. 프로필 섹션 */}
                <section className="p-3 border-bottom cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => nav("/mypage/detail")}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <BootstrapImage
                                src={imagePreviewUrl || defaultImage}
                                roundedCircle
                                className="me-3"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                            <div className="d-flex flex-column">
                                <h3 className="fs-5 fw-bold mb-0">{userName}님</h3>
                            </div>

                        </div>
                        {/* 우측 화살표 */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                </section>

                {/* 4. 내가 작성한 후기 링크 */}
                <section onClick={onReviewListForm} className="d-flex justify-content-between align-items-center py-3 px-3 border-bottom text-dark cursor-pointer" style={{ fontSize: '0.9rem' }}>
                    <h6 className="mb-0">내가 작성한 후기</h6>
                </section>

                {/* 5. 주문 내역 섹션 */}
                <section className="py-3 px-3">
                    <h4 className="fs-5 fw-bold mb-3">주문 내역</h4>

                    {/* 주문 내역 리스트 (스크롤 가능한 영역) */}
                    <div className="order-list-scroll">
                        {orderList.length > 0 ? (
                            orderList.map((item) => (
                                <div
                                    key={item.orderItemId}
                                    className="d-flex py-3 border-bottom"
                                    style={{ cursor:'pointer'}}
                                    onClick={() => onOrderDetail(item.orderId)} // 해상 상품 주문 번호 전달
                                >
                                    {/* ... 상품 정보 렌더링 코드 유지 ... */}
                                    <BootstrapImage
                                        alt={item.productName}
                                        src={getImageUrl(item.productImageId)}
                                        className="me-3 rounded"
                                        style={{ width: '60px', height: '90px', objectFit: 'cover' }}
                                    />
                                    <div className="d-flex flex-column justify-content-center">
                                        <p className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>{item.sellerBusinessName}</p>
                                        <p className="fw-semibold mb-1" style={{ fontSize: '0.9rem', lineHeight: '1.3' }}>{item.productName}</p>
                                        <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>{item.productName} / {item.quantity}개</p>
                                        <p className="text-muted text-decoration-line-through mb-0" style={{ fontSize: '0.75rem' }}>{formatPrice(item.originalPrice)}원</p>
                                        <p className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>{formatPrice(item.discountedPrice)}원</p>

                                    </div>
                                    <div  className="MypageOrderDate ms-auto align-self-start text-end" style={{ fontSize: '0.95rem' }}>{item.orderDate}</div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted py-5">주문 내역이 없습니다.</p>
                        )}
                    </div>
                </section>
            </Container>
        </div>
    );
}

export default MyPage;