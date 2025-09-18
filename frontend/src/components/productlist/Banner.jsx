import "./Banner.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Carousel } from 'react-bootstrap'; // Bootstrap Carousel 컴포넌트 import
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS import
import king from "../../assets/king.jpg"
const Banner = () => {
    const [bannerItems, setBannerItems] = useState([]); // 이름 변경: banner -> bannerItems

    useEffect(() => {
        const fetchBannerData = async () => {
            try {
                const response = await axios.get('/api/product/banner');
                // API 응답 데이터 구조 예시:
                // [{ imageUrl: "url1", title: "PAULA'S CHOICE", description: "과학과 진실에 근거한 브랜드" }, ...]
                if (Array.isArray(response.data)) {
                    setBannerItems(response.data);
                } else {
                    console.error('API response is not an array:', response.data);
                    setBannerItems([]); // 에러 시 빈 배열로 초기화
                }
            } catch (error) {
                console.error('Error fetching banner data:', error);
                setBannerItems([]); // 에러 시 빈 배열로 초기화
            }
        };
        fetchBannerData();
    }, []);

    // 배너 데이터가 없을 경우 로딩 메시지 또는 빈 컴포넌트 반환
    if (bannerItems.length === 0) {
        return <p>배너 로딩 중...</p>; // 또는 <div>배너를 불러올 수 없습니다.</div>
    }

    return (
        <div className="Banner_Container">
            <Carousel
                indicators={false} // 하단 인디케이터(점) 제거
                prevIcon={<span aria-hidden="true" className="carousel-control-prev-icon custom-arrow"></span>} // 이전 화살표 커스터마이징
                nextIcon={<span aria-hidden="true" className="carousel-control-next-icon custom-arrow"></span>} // 다음 화살표 커스터마이징
            >
                {bannerItems.map((item, index) => (
                    <Carousel.Item key={index}>
                        <img
                            className="d-block w-100 banner-image"
                            src={king} // API에서 받아온 이미지 URL
                            alt={`Banner ${index}`}
                        />
                        <Carousel.Caption className="banner-caption">
                            {/* 이미지의 텍스트 오버레이와 유사한 스타일 */}
                            <h3>{item.originName}</h3>
                            <p>설명란</p>                            {/* 필요하다면 추가 버튼 등 */}
                            <button className="banner-button">자세히 보기</button>
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
};

export default Banner;