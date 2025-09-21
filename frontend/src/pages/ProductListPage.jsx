import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from "../components/productlist/ProductCard.jsx";
import Banner from "../components/productlist/Banner.jsx";
import axios from 'axios';
import { Row, Col, Container } from 'react-bootstrap'; // Import Bootstrap components

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 8; // A good number for a 4-column grid
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

            console.log(response.data.content);

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

    if (loading) {
        return <div>상품을 불러오는 중...</div>;
    }

    return (
         <div className="productListPage">
            <div className="productListPage_Header">
                <h1>상품 목록</h1>
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
                    <Container>
                        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                            {products.map(product => (
                                <Col key={`ProductCard-${product.productId}`}>
                                    <ProductCard product={product} />
                                </Col>
                            ))}
                        </Row>
                    </Container>
                ) : (
                    <div>해당 조건에 맞는 상품이 없습니다.</div>
                )}
            </div>
            {/* Pagination controls */}
            <div className="pagination-controls" style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                >
                    이전
                </button>
                <span style={{ margin: '0 10px' }}>
                    {currentPage + 1} / {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                >
                    다음
                </button>
            </div>
        </div>
    );
};

export default ProductListPage;