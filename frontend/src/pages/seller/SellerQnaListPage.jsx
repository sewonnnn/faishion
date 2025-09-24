import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Table,
    Form,
    Button,
    Pagination,
    Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext.jsx";

const SellerQnaListPage = () => {
    const [qnaBoardList, setQnaBoardList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const {api} = useAuth();
    const pageSize = 10;
    const navigate = useNavigate();

    const fetchQnaData = async (query = "", pageNum = 0) => {
        setIsLoading(true);
        try {
            const response = await api.get(
                `/qna/list?q=${query}&page=${pageNum}`
            );
            setQnaBoardList(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("데이터를 가져오는 중 오류 발생:", error);
            setQnaBoardList([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQnaData();
    }, []);

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handlePageChange = (pageNum) => {
        if (pageNum >= 0 && pageNum < totalPages) {
            setPage(pageNum);
            fetchQnaData(searchText, pageNum);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0);
        fetchQnaData(searchText, 0);
    };

    const handleGoDetail = (id) => {
        navigate(`/seller/qna/${id}`);
    };

    return (
        <Container className="my-5">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center">Q&A</h1>
                </Col>
            </Row>
            <div className="d-flex justify-content-end align-items-center mb-4">
                <Form onSubmit={handleSearchSubmit} className="d-flex">
                    <Form.Control
                        type="text"
                        placeholder="Search"
                        value={searchText}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                    <Button variant="primary" style={{width :"100px"}} type="submit">
                        검색
                    </Button>
                </Form>
            </div>
            <div className="bg-light p-4 rounded shadow-sm">
                <Table hover responsive className="text-center">
                    <colgroup>
                        <col style={{ width: "8%" }} />
                        <col style={{ width: "35%" }} />
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "17%" }} />
                        <col style={{ width: "15%" }} />
                    </colgroup>
                    <thead>
                    <tr>
                        <th>No</th>
                        <th>상품명</th>
                        <th>제목</th>
                        <th>작성시간</th>
                        <th>답변상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="5" className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">로딩 중...</p>
                            </td>
                        </tr>
                    ) : qnaBoardList.length > 0 ? (
                        qnaBoardList.map((item, index) => {
                            const sequentialNumber = page * pageSize + index + 1;
                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => handleGoDetail(item.id)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td>{sequentialNumber}</td>
                                    <td className="text-center">{item.productName || "상품 정보 없음"}</td>
                                    <td className="text-center">{item.title}</td>
                                    <td>
                                        {new Date(item.created_at).toLocaleDateString("ko-KR", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        })}
                                    </td>
                                    <td>{item.answer ? "답변 완료" : "답변 대기"}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-5">
                                게시글이 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </div>

            <div className="d-flex justify-content-center mt-4">
                <Pagination>
                    <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 0} />
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                            key={i}
                            active={i === page}
                            onClick={() => handlePageChange(i)}
                        >
                            {i + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1} />
                </Pagination>
            </div>
        </Container>
    );
};

export default SellerQnaListPage;