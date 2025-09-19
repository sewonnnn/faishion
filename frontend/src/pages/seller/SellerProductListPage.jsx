import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Image, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

const SellerProductListPage = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/product/list");
                setProducts(response.data);
            } catch (error) {
                console.error("상품 목록 조회 실패:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <Container className="my-5">
            <h1 className="mb-4">Seller Product List</h1>
            {products.length === 0 ? (
                <p>상품이 없습니다.</p>
            ) : (
                <Table bordered hover responsive>
                    <thead>
                    <tr className="text-center">
                        <th>NO</th>
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
                        <tr key={product.id} className="align-middle">
                            <td className="text-center">{index + 1}</td>
                            <td className="d-flex align-items-center">
                                {/* 첫 번째 이미지가 존재하면 표시 */}
                                {product.imageList && product.imageList.length > 0 ? (
                                    <img
                                        src={`http://localhost:8080/image/${product.imageList[0]}`}
                                        alt={product.name}
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            objectFit: "cover",
                                            marginRight: "10px",
                                        }}
                                        className="rounded"
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            backgroundColor: "#e9ecef",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginRight: "10px",
                                        }}
                                        className="rounded"
                                    >
                                        <small>사진</small>
                                    </div>
                                )}
                                <span>{product.name}</span>
                            </td>
                            <td>{product.price}원</td>
                            <td>{product.category}</td>
                            <td>{product.status}</td>
                            <td>{product.stock}</td>
                            <td>
                                <Button variant="light">수정</Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default SellerProductListPage;