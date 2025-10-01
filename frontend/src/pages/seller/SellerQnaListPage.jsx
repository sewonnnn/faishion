// SellerQnaListPage.jsx (수정된 전체 코드)

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
    // 💡 답변 대기 상태 필터링 상태 추가 (기본: 전체 조회)
    const [isPending, setIsPending] = useState(false);

    const {api} = useAuth();
    const pageSize = 10;
    const navigate = useNavigate();

    // 💡 API 호출 엔드포인트를 /qna/dashboard/list로 변경하고 isPending 쿼리 파라미터 추가
    const fetchQnaData = async (query = "", pageNum = 0, pending = false) => {
        setIsLoading(true);
        try {
            // 💡 /qna/dashboard/list 호출 및 pending=true/false 전송
            const response = await api.get(
                `/qna/dashboard/list?q=${query}&page=${pageNum}&pending=${pending}`
            );

            // ⭐ 콘솔 로그 1: API 응답 데이터 확인
            console.log("--- QnA API 응답 데이터 (페이지 로드) ---");
            console.log(`요청 상태: Pending=${pending}, 검색어=${query}`);
            console.log("전체 응답:", response.data);
            console.log("QnA 목록 (content):", response.data.content);
            console.log("-----------------------------------------");

            setQnaBoardList(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("대시보드 QnA 데이터를 가져오는 중 오류 발생:", error);
            // 403 Forbidden 에러 발생 시 목록 비우기
            if (error.response && error.response.status === 403) {
                alert("권한이 없어 대시보드 문의 목록을 불러올 수 없습니다.");
            }
            setQnaBoardList([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // 💡 isPending 상태를 초기 로딩에 반영
        fetchQnaData("", 0, isPending);
    }, [isPending]); // isPending이 바뀔 때마다 다시 호출

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handlePageChange = (pageNum) => {
        if (pageNum >= 0 && pageNum < totalPages) {
            setPage(pageNum);
            // 💡 isPending 상태를 페이지 변경 시에도 유지
            fetchQnaData(searchText, pageNum, isPending);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0);
        // 💡 isPending 상태를 검색 시에도 유지
        fetchQnaData(searchText, 0, isPending);
    };

    const handleGoDetail = (id) => {
        // Seller/Admin QnA 상세 페이지 경로로 이동
        navigate(`/seller/qna/${id}`);
    };

    // 💡 답변 상태 필터링 핸들러
    const handleFilterChange = (pendingState) => {
        // 검색어와 페이지 초기화 후 isPending 상태 변경
        setSearchText("");
        setPage(0);
        setIsPending(pendingState);
        // isPending useEffect가 재호출을 담당하므로 여기서 fetch는 생략
    }

    return (
        <Container className="my-5">
            <Row className="mb-4">
                <Col>
                    <h3>대시보드 Q&A 관리</h3>
                </Col>
            </Row>

            {/* 💡 필터링 버튼 추가 */}
            <div className="d-flex justify-content-start mb-3">
                <div className="d-flex justify-content-start mb-3">
                    <Button
                        variant={!isPending ? "primary" : "outline-secondary"}
                        className="me-2"
                        onClick={() => handleFilterChange(false)}
                    >
                        전체 문의
                    </Button>
                    <Button
                        variant={isPending ? "danger" : "outline-danger"}
                        onClick={() => handleFilterChange(true)}
                    >
                        답변 대기 ({isPending ? qnaBoardList.length : qnaBoardList.filter(item => !item.isAnswered).length})
                    </Button>
                </div>
            </div>
            {/* --- 필터링 버튼 끝 --- */}

            <div className="d-flex justify-content-end align-items-center mb-4">
                <Form onSubmit={handleSearchSubmit} className="d-flex">
                    <Form.Control
                        type="text"
                        placeholder="제목 검색"
                        value={searchText}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                    <Button variant="primary" style={{width :"100px"}} type="submit">
                        검색
                    </Button>
                </Form>
            </div>
            <div className="bg-light p-4 rounded">
                <Table hover responsive className="text-center">
                    <colgroup>
                        <col style={{ width: "8%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "17%" }} />
                        <col style={{ width: "15%" }} />
                    </colgroup>
                    <thead>
                    <tr>
                        <th>No</th>
                        <th>유형</th>
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
                        qnaBoardList
                            .filter(item => !isPending || !item.isAnswered)
                            .map((item, index) => {
                                const sequentialNumber = page * pageSize + index + 1;

                                // ⭐ 콘솔 로그 2: 각 항목의 답변 상태 확인
                                console.log(`QnA ID ${item.id} - Title: ${item.title}`);
                                console.log(`  -> isAnswered: ${item.isAnswered}`);
                                console.log(`  -> Answer Content (for check): ${item.answer}`);

                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() => handleGoDetail(item.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{sequentialNumber}</td>
                                        {/* 💡 유형 표시 복원 */}
                                        <td className="text-center">
                                            {item.qnaType === 'GENERAL' ? '일반문의' :
                                                (item.productName || '상품문의')}
                                        </td>
                                        <td className="text-center">{item.title}</td>
                                        <td>
                                            {new Date(item.created_at).toLocaleDateString("ko-KR", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })}
                                        </td>
                                        {/* 💡 답변 상태 표시 복원 */}
                                        <td>
                                            {item.isAnswered ? (
                                                <span className="text-success fw-bold">답변 완료</span>
                                            ) : (
                                                <span className="text-danger">답변 대기</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-5">
                                {isPending ? "답변 대기 중인 문의가 없습니다." : "게시글이 없습니다."}
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