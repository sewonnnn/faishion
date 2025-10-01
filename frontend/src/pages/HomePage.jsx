import Banner from "../components/productlist/Banner.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";
import React, {useEffect, useState} from "react";
import ProductListPage from "./ProductListPage.jsx";
import MultiCarousel from '../components/home/MultiCarousel';

const HomePage = () => {
    const { api } = useAuth();
    const [carouselItems, setCarouselItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await api.get('/user/banner');
                const bannerDTOs = response.data;
                const transformedItems = bannerDTOs.map((dto) => ({
                    id: dto.productId,
                    image: `${api.defaults.baseURL}/image/${dto.imageId}`,
                    aiImage: `${api.defaults.baseURL}/image/${dto.aiImageId}`,
                    description: dto.description,
                    businessName: dto.businessName,
                }));
                setCarouselItems(transformedItems);
            } catch (e) {
                console.error("Error fetching banners:", e);
                // Axios 에러 처리
                setError(e.response ? e.response.data.message : e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBanners();
    }, [api]); // api가 변경될 일은 거의 없지만, useEffect의 의존성 배열에 포함

    if (isLoading) {
        return <div style={{textAlign: 'center', padding: '20px'}}>✨ 배너 정보를 로딩 중이에요...</div>;
    }
    if (error) {
        // 서버에서 에러 메시지가 온 경우를 보여줍니다.
        return <div style={{textAlign: 'center', padding: '20px', color: 'red'}}>⚠️ 배너 로딩 실패: {error}</div>;
    }

    return (
        <>
            <MultiCarousel items={carouselItems}/>
            <div className="productListPage_Banners">
{/*                 <Banner /> */}
                <ProductListPage/>
            </div>
        </>
    );
}

export default HomePage;