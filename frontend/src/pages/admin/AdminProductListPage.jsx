import { useEffect, useState } from "react";
import { Container, Table, Button, Pagination, Form } from "react-bootstrap";
import React from "react";
import {useAuth} from "../../contexts/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import "./AdminProductListPage.css";

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
                const response = await api.get(`/product/admin/list?page=${page}&size=${pageSize}`);
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

    const handlePickToggle = async (productId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            const response = await api.put(`/product/admin/pick/${productId}`, {
                pick: newStatus,
            });
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === productId ? { ...product, pick: response.data } : product
                )
            );
        } catch (error) {
            console.error(`상품 ID ${productId} 추천 상태 변경 실패:`, error);
            // 사용자에게 실패를 알리는 알림을 추가할 수 있습니다.
            alert("상품 추천 상태 변경에 실패했습니다.");
        }
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
            <h3 className="mb-4">판매자 상품 관리</h3>
            {totalElements === 0 ? (
                <p>상품이 없습니다.</p>
            ) : (
                <>
                    <Table bordered hover responsive className="admin-table text-center align-middle">
                        <thead>
                            <tr className="text-center">
                                <th>브랜드명</th>
                                <th>상품명</th>
                                <th>판매가</th>
                                <th>카테고리</th>
                                <th>상태</th>
                                <th>재고</th>
                                <th>추천</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={`product-${product.id}`} className="align-middle">
                                    <td>
                                        {product.businessName}
                                    </td>
                                    <td className="d-flex align-items-center">
                                        <img
                                            src={`${api.defaults.baseURL}/image/${product.mainImageList[0]}`}
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
                                                <div style={{ color: "#1850DB" }}>
                                                   <b>{product.discountPrice}원</b>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {product.price}원
                                            </div>
                                        )}
                                    </td>
                                    <td>{product.categoryGroupName} &gt; {product.categoryName}</td>
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
                                    <td className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            checked={product.pick || false}
                                            onChange={() => handlePickToggle(product.id, product.pick)}
                                        />
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