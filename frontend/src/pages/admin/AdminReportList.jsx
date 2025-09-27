// src/components/AdminReportList.jsx (새 파일)
import React, { useState, useEffect } from 'react';
import { ListGroup, Card, Button, Pagination, Alert } from 'react-bootstrap';
import axios from 'axios';
import {useAuth} from "../../contexts/AuthContext.jsx";
const AdminReportList = () => {
    const [reports, setReports] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {api} = useAuth();

    // 1. 신고 목록 조회 함수
    const fetchReports = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/report/list?page=${page - 1}&size=10`);
            if (response.data && response.data.content) {
                setReports(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(page);
            }
        } catch (err) {
            setError('신고 목록을 불러오는 데 실패했습니다.');
            setReports([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // 2. 리뷰 삭제 처리 함수
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm(`정말로 리뷰 ID: ${reviewId} 를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await api.delete(`/report/delete/${reviewId}`);
            alert('리뷰가 성공적으로 삭제되었습니다.');
            // 삭제 후 목록 새로고침
            fetchReports(currentPage);
        } catch (err) {
            alert('리뷰 삭제 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        fetchReports(1); // 컴포넌트 마운트 시 첫 페이지 로드
    }, []);

    const renderPaginationItems = () => {
        const items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => fetchReports(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return items;
    };

    if (loading) return <div className="text-center mt-5">로딩 중...</div>;
    if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

    return (
        <div className="admin-report-list container mt-5">
            <h2 className="mb-4">🚨 신고 접수 목록 (관리자)</h2>
            {reports.length === 0 ? (
                <p className="text-center text-muted">현재 접수된 신고가 없습니다.</p>
            ) : (
                <>
                   <ListGroup>
                       {reports.map((report) => (
                           <ListGroup.Item key={report.id} className="d-flex justify-content-between align-items-start">
                               <div className="flex-grow-1">
                                   <strong className="text-danger">{report.reason}</strong>
                                   <small className="ms-3 text-muted">신고 ID: {report.id} | 리뷰 ID: {report.reviewId} | 상태: {report.status || '대기'}</small>
                                   <Card.Text className="mt-1 mb-1">
                                       상세: {report.description}
                                   </Card.Text>
                                   <Card.Text className="text-break fst-italic">
                                       **신고된 리뷰 내용:** "{report.reviewContent}" {/* 🚨 review.content -> reviewContent */}
                                   </Card.Text>
                                   <small className="text-secondary">신고자: {report.reporterId} ({report.createdAt})</small> {/* 🚨 report.reporter.id -> reporterId */}
                               </div>
                               <div>
                                   <Button
                                       variant="danger"
                                       size="sm"
                                       onClick={() => handleDeleteReview(report.reviewId)} // reviewId를 사용
                                   >
                                       리뷰 삭제 처리
                                   </Button>
                                   {/* <Button variant="secondary" size="sm" className="ms-2">상태 변경</Button> */}
                               </div>
                           </ListGroup.Item>
                       ))}
                   </ListGroup>

                    <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                            <Pagination.First onClick={() => fetchReports(1)} disabled={currentPage === 1} />
                            <Pagination.Prev onClick={() => fetchReports(currentPage - 1)} disabled={currentPage === 1} />
                            {renderPaginationItems()}
                            <Pagination.Next onClick={() => fetchReports(currentPage + 1)} disabled={currentPage === totalPages} />
                            <Pagination.Last onClick={() => fetchReports(totalPages)} disabled={currentPage === totalPages} />
                        </Pagination>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminReportList;