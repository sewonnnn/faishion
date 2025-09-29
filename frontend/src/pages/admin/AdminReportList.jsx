// src/components/AdminReportList.jsx (최종 수정본)
import React, { useState, useEffect } from 'react';
import { ListGroup, Card, Button, Pagination, Alert, Badge } from 'react-bootstrap';
import { useAuth } from "../../contexts/AuthContext.jsx";

const AdminReportList = () => {
    const [reports, setReports] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { api } = useAuth();

    // 1. 통합 신고 목록 조회 함수
    const fetchReports = async (page) => {
        setLoading(true);
        setError(null);
        try {
            // 💡 통합 API 엔드포인트 사용: /admin/reports/list
            const response = await api.get(`/admin/reports/list?page=${page - 1}&size=10`);

            if (response.data && response.data.content) {
                setReports(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(page);
            }
        } catch (err) {
            console.error("통합 신고 목록 불러오기 실패:", err);
            setError('신고 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 2. 신고 대상 삭제/처리 함수 (유형에 따라 분기)
    const handleDeleteTarget = async (reportId, type, targetId) => {
        let confirmMessage = '';
        let url = '';
        let method = 'DELETE';

        if (type === 'REVIEW') {
            // 리뷰 삭제 처리 (리뷰 및 관련 신고 삭제)
            confirmMessage = `[리뷰 신고] 리뷰 ID: ${targetId} 와 모든 관련 신고를 삭제 처리하시겠습니까?`;
            url = `/report/delete/${targetId}`; // 기존 리뷰 삭제 API 사용
            method = 'DELETE';
        } else if (type === 'SELLER') {
            // 판매자 신고 처리 (신고 상태만 '처리 완료'로 변경)
            confirmMessage = `[판매자 신고] 신고 ID: ${reportId} 를 '처리 완료'로 변경하시겠습니까? (실제 판매자 제재는 별도 관리)`;
            url = `/admin/reports/seller/${reportId}/process`; // 새로 만든 처리 완료 API
            method = 'PUT'; // 상태 변경이므로 PUT 사용
        } else {
            return;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            // axios의 request 메서드를 사용하여 동적으로 메서드 지정
            await api.request({ method: method, url: url });
            alert(`${type} 신고 처리가 성공적으로 완료되었습니다.`);
            fetchReports(currentPage); // 처리 후 목록 새로고침
        } catch (err) {
            console.error(`${type} 신고 처리 오류:`, err);
            const msg = err.response?.data || `${type} 신고 처리 중 오류가 발생했습니다.`;
            alert(msg);
        }
    };

    useEffect(() => {
        fetchReports(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderPaginationItems = () => {
        const items = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, currentPage + 2);

        for (let number = start; number <= end; number++) {
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
            <h2 className="mb-4">🚨 통합 신고 접수 목록 (관리자)</h2>
            {reports.length === 0 ? (
                <p className="text-center text-muted">현재 접수된 신고가 없습니다.</p>
            ) : (
                <>
                   <ListGroup>
                       {reports.map((report) => (
                           <ListGroup.Item key={`${report.type}-${report.id}`} className="d-flex justify-content-between align-items-start">
                               <div className="flex-grow-1">
                                   <div className="mb-1">
                                       {/* 신고 유형 배지 */}
                                       <Badge bg={report.type === 'REVIEW' ? 'danger' : 'primary'} className="me-2">
                                           {report.type === 'REVIEW' ? '리뷰 신고' : '판매자 신고'}
                                       </Badge>
                                       <strong className="text-danger">{report.reason}</strong>
                                       <small className="ms-3 text-muted">
                                           신고 ID: {report.id} |
                                           대상 ID: {report.targetId} |
                                           상태: <span className={report.status === '처리 완료' ? 'text-success' : 'text-danger'}>{report.status || '대기'}</span>
                                       </small>
                                   </div>

                                   <Card.Text className="mt-1 mb-1">
                                       **대상 정보:** {report.type === 'REVIEW' ? `리뷰 ID ${report.targetId}` : `상품 ID ${report.targetId}`}
                                       ({report.contentPreview})
                                   </Card.Text>

                                   <Card.Text className="mb-1">
                                       **상세 사유:** {report.description}
                                   </Card.Text>

                                   <small className="text-secondary">신고자: {report.reporterId} ({new Date(report.createdAt).toLocaleString()})</small>
                               </div>
                               <div>
                                   <Button
                                       variant={report.type === 'REVIEW' ? 'danger' : 'success'}
                                       size="sm"
                                       // targetId를 리뷰 ID 또는 상품 ID로 사용
                                       onClick={() => handleDeleteTarget(report.id, report.type, report.targetId)}
                                       disabled={report.status === '처리 완료' && report.type === 'SELLER'} // 판매자 신고는 처리 완료 시 버튼 비활성화
                                   >
                                       {report.type === 'REVIEW' ? '리뷰 삭제 처리' : '신고 처리 완료'}
                                   </Button>
                               </div>
                           </ListGroup.Item>
                       ))}
                   </ListGroup>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.First onClick={() => fetchReports(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => fetchReports(currentPage - 1)} disabled={currentPage === 1} />
                                {renderPaginationItems()}
                                <Pagination.Next onClick={() => fetchReports(currentPage + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => fetchReports(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminReportList;