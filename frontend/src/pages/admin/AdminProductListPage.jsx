import { useEffect, useState } from "react";
import { Container, Table, Button, Pagination } from "react-bootstrap";
import React from "react";
import {useAuth} from "../../contexts/AuthContext.jsx";
import {useNavigate} from "react-router-dom";

const AdminProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(5);
    const { api } = useAuth();
    const navigate = useNavigate();
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

    return (
        <Container className="my-5">
            <h1 className="mb-4">Admin Product List</h1>
            {totalElements === 0 ? (
                <p>상품이 없습니다.</p>
            ) : (
                <>
                    {/* The problem is here. Remove the nested div and table tags. */}
                    <Table bordered hover responsive>
                        <thead>
                            <tr className="text-center">
                                <th>브랜드명</th>
                                <th>상품명</th>
                                <th>판매가</th>
                                <th>카테고리</th>
                                <th>상태</th>
                                <th>재고 (옵션별)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={`product-${product.id}`} className="align-middle">
                                    <td>
                                        {product.}
                                    </td>
                                    <td className="d-flex align-items-center">
                                        <img
                                            src={`http://localhost:8080/image/${product.mainImageList[0]}`}
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                objectFit: "cover",
                                                marginRight: "10px",
                                            }}
                                            className="rounded"
                                        />
                                        <span>{product.name}</span>
                                    </td>
                                    <td>
                                        {product.discountPrice && product.discountPrice != product.price && product.discountStartDate && product.discountEndDate && new Date() >= new Date(product.discountStartDate) && new Date() <= new Date(product.discountEndDate) ? (
                                            <div>
                                                <div style={{ textDecoration: "line-through", color: "gray" }}>
                                                    {product.price}원
                                                </div>
                                                <div style={{ color: "red" }}>
                                                    {product.discountPrice}원
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {product.price}원
                                            </div>
                                        )}
                                    </td>
                                    <td>{product.categoryGroupName} {product.categoryName}</td>
                                    <td>{product.status === 1 ? '판매 중' : '판매 중지'}</td>
                                    <td>
                                        <ul className="list-unstyled mb-0">
                                            {product.stockList && product.stockList.map(stock => (
                                                <li key={`stock-${stock.id}`}>
                                                    {stock.color} / {stock.size}: {stock.quantity}개
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>
                                        <Button variant="light" onClick={() => navigate(`/seller/product/edit`, {state : {product}})}>수정</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <div className="d-flex justify-content-center">
                        <Pagination>
                            <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 0} />
                            {renderPaginationItems()}
                            <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} />
                        </Pagination>
                    </div>
                </>
            )}
        </Container>
    );
};

export default AdminProductListPage;