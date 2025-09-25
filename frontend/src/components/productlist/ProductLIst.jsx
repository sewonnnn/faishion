import React from 'react';
import { Row, Col, Container, Pagination, Spinner } from 'react-bootstrap';
import ProductCard from "./ProductCard.jsx";

const ProductList = ({ products, loading, currentPage, totalPages, setCurrentPage }) => {

    // 로딩 중일 때 보여줄 UI
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" />
                <span className="ms-2">상품을 불러오는 중...</span>
            </div>
        );
    }
    const renderPaginationItems = () => {
        let items = [];
        for (let number = 0; number < totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                >
                    {number + 1}
                </Pagination.Item>
            );
        }
        return items;
    };

    return (
        <div className="product-list-section">
            {products.length > 0 ? (
                <>
                    <Container>
                        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                            {products.map(product => (
                                <Col key={product.productId}>
                                    <ProductCard product={product} />
                                </Col>
                            ))}
                        </Row>
                    </Container>
                    <div className="d-flex justify-content-center mt-5">
                        <Pagination>
                            <Pagination.Prev
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                            />
                            {renderPaginationItems()}
                            <Pagination.Next
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage >= totalPages - 1}
                            />
                        </Pagination>
                    </div>
                </>
            ) : (
                <div className="text-center p-5 border rounded">
                    <p className="lead text-muted">해당 조건에 맞는 상품이 없습니다.</p>
                </div>
            )}
        </div>
    );
};

export default ProductList;