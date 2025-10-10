import { useEffect, useState } from "react";
import { Container, Table, Button, Pagination, Modal } from "react-bootstrap";
import React from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ReviewList from "../../components/productdetail/ReviewList";
import './SellerProductListPage.css';

const SellerProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(5);
    const { api } = useAuth();
    const navigate = useNavigate();

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get(`/product/seller/list?page=${page}&size=${pageSize}`);
                setProducts(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            } catch (error) {
                console.error("상품 목록 조회 실패:", error);
            }
        };
        fetchProducts();
    }, [page, pageSize, api]);

    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    const handleAddProduct = () => {
        navigate("/seller/product/new");
    };

    const renderPaginationItems = () => {
        let items = [];
        for (let number = 0; number < totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={`page-${number}`}
                    active={number === page}
                    onClick={() => handlePageChange(number)}
                >
                    {number + 1}
                </Pagination.Item>
            );
        }
        return items;
    };

    const handleShowReviewModal = (productId) => {
        setSelectedProductId(productId);
        setShowReviewModal(true);
    };

    const handleCloseReviewModal = () => {
        setShowReviewModal(false);
        setSelectedProductId(null);
    };

    return (
        <Container className="my-5 seller-container">
            <h3 className="mb-4 seller-title">상품 관리</h3>

            {totalElements === 0 ? (
                <p className="text-center seller-no-products">상품이 없습니다.</p>
            ) : (
                <>
                    <Table bordered hover responsive className="seller-table text-center align-middle">
                        <thead>
                        <tr>
                            <th>NO</th>
                            <th>사진</th>
                            <th>상품명</th>
                            <th>판매가</th>
                            <th>카테고리</th>
                            <th>상태</th>
                            <th>재고</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((product, index) => (
                            <tr key={`product-${product.id}`}>
                                <td>{index + 1 + page * pageSize}</td>
                                <td>
                                    <div className="seller-image-placeholder">
                                        <img
                                            src={`${api.defaults.baseURL}/image/${product.mainImageList[0]}`}
                                            alt="상품"
                                            className="seller-product-image"
                                        />
                                    </div>
                                </td>
                                <td
                                    className="text-start seller-clickable-name"
                                    onClick={() => handleShowReviewModal(product.id)}
                                >
                                    {product.name}
                                </td>
                                <td>
                                    {product.discountPrice &&
                                    product.discountPrice !== product.price &&
                                    product.discountStartDate &&
                                    product.discountEndDate &&
                                    new Date() >= new Date(product.discountStartDate) &&
                                    new Date() <= new Date(product.discountEndDate) ? (
                                        <div>
                                            <div className="seller-original-price">
                                                {product.price}원
                                            </div>
                                            <div className="seller-discount-price">
                                                <b>{product.discountPrice}원</b>
                                            </div>
                                        </div>
                                    ) : (
                                        <div><b>{product.price}원</b></div>
                                    )}
                                </td>
                                <td>{product.categoryGroupName} &gt; {product.categoryName}</td>
                                <td>{product.status === 1 ? "판매중" : "판매중지"}</td>
                                <td>
                                    {product.stockList?.[0]
                                        ? product.stockList.reduce((acc, stock) => acc + stock.quantity, 0)
                                        : 0}
                                </td>
                                <td>
                                    <Button
                                        variant="light"
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/seller/product/edit`, { state: { product } })
                                        }
                                        className="seller-edit-button"
                                    >
                                        수정
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-center my-3">
                        <Pagination className="seller-pagination">
                            <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 0} />
                            {renderPaginationItems()}
                            <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} />
                        </Pagination>
                    </div>
                </>
            )}

            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={handleAddProduct} className="seller-add-button">
                    상품 등록
                </Button>
            </div>

            <Modal show={showReviewModal} onHide={handleCloseReviewModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>상품 리뷰 목록</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProductId && <ReviewList productId={selectedProductId} />}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseReviewModal}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SellerProductListPage;
