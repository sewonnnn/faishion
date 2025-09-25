import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Banner from "../components/productlist/Banner.jsx";
import axios from 'axios';
import ProductList from "../components/productlist/ProductList.jsx";
import { Container } from 'react-bootstrap';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 8;
    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryId = searchParams.get('categoryId');
        const searchQuery = searchParams.get('searchQuery');

        setLoading(true);

        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/product/list', {
                    params: {
                        categoryId: categoryId,
                        searchQuery: searchQuery,
                        page: currentPage,
                        size: pageSize
                    }
                });
                setProducts(response.data.content);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            } catch (error) {
                console.error("상품 목록을 불러오는 중 오류가 발생했습니다:", error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, [location.search, currentPage]);

    return (
        <Container className="my-5">
            {/* 페이지 헤더는 ProductListPage에서 직접 렌더링 */}
            <h1 className="text-center mb-4">상품 목록</h1>
            <div className="text-center mb-4 p-3 bg-light rounded">
                <p className="mb-0"><strong>현재 필터링 조건: </strong>
                    {location.search || '없음'}
                </p>
            </div>

            <div className="mb-5">
                <Banner/>
            </div>

            <ProductList
                products={products}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
            />
        </Container>
    );
};

export default ProductListPage;