import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from "../components/productlist/ProductCard.jsx";
import Banner from "../components/productlist/Banner.jsx";

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // URL의 쿼리 파라미터 가져오기
        const searchParams = new URLSearchParams(location.search);
        const category = searchParams.get('category');
        const subCategory = searchParams.get('subCategory');
        const item = searchParams.get('item');
        const type = searchParams.get('type'); // Header.jsx에서 넘겨준 type (여성/남성)

        setLoading(true);

        // API 호출 함수
        // 실제 API 엔드포인트에 맞게 URL을 구성하세요.
        const fetchProducts = async () => {
            let apiUrl = '/api/product/list';
            const params = [];

            // 쿼리 파라미터가 있는 경우 params 배열에 추가
            if (type) params.push(`type=${type}`);
            if (category) params.push(`category=${category}`);
            if (subCategory) params.push(`subCategory=${subCategory}`);
            if (item) params.push(`item=${item}`);

            if (params.length > 0) {
                apiUrl += `?${params.join('&')}`;
            }

            try {
                // 이 부분은 실제 API 호출로 대체되어야 합니다.
                // const response = await fetch(apiUrl);
                // const data = await response.json();

                // 임시 데이터 (실제 API 호출로 대체하세요)
                const mockData = [
                    { id: 1, name: '여성용 원피스 (S)', category: '여성', subCategory: '의류', item: '원피스' },
                    { id: 2, name: '남성용 티셔츠 (L)', category: '남성', subCategory: '의류', item: '상의' },
                    { id: 3, name: '여성용 숄더백 (블랙)', category: '여성', subCategory: '가방', item: '숄더백' },
                    { id: 4, name: '남성용 백팩 (화이트)', category: '남성', subCategory: '가방', item: '백팩' },
                    { id: 5, name: '여성용 스니커즈 (240)', category: '여성', subCategory: '신발', item: '스니커즈' },
                    { id: 6, name: '남성용 로퍼', category: '남성', subCategory: '신발', item: '로퍼' }
                ];

                const filteredProducts = mockData.filter(product => {
                    return (!type || product.category === type) &&
                        (!category || product.category === category) &&
                        (!subCategory || product.subCategory === subCategory) &&
                        (!item || product.item === item);
                });

                setProducts(filteredProducts);
                setLoading(false);
            } catch (error) {
                console.error("상품 목록을 불러오는 중 오류가 발생했습니다:", error);
                setLoading(false);
            }
        };

        fetchProducts();

    }, [location.search]); // URL의 쿼리 파라미터가 변경될 때마다 useEffect를 다시 실행

    if (loading) {
        return <div>상품을 불러오는 중...</div>;
    }

    return (
        <div className="productListPage">
            <div className="productListPage_Header">
                <h1>상품 목록</h1>
                {/* 현재 URL의 쿼리 정보를 보여주기 위해 추가 */}
                <div style={{ padding: '10px', background: '#f0f0f0', border: '1px solid #ddd' }}>
                    <strong>현재 필터링 조건: </strong>
                    {location.search || '없음'}
                </div>
            </div>
            <div className="productListPage_Banner">
                <Banner/>
            </div>
            <div className="productListPage_ProductList">
                {products.length > 0 ? (
                    products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div>해당 조건에 맞는 상품이 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default ProductListPage;
