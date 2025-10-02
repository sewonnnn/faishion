// src/components/AdminReportList.jsx (최종 수정본: 필터 및 검색 기능 추가)
import React, { useState, useEffect, useCallback } from 'react';
import "./AdminReportList.css";

import {
    ListGroup, Card, Button, Pagination, Alert, Badge,
    Container, Row, Col, Form, InputGroup
} from 'react-bootstrap';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { FaSearch } from 'react-icons/fa'; // 검색 아이콘 사용을 가정

const AdminReportList = () => {
    // 💡 새로운 상태 추가: 필터와 검색어
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'REVIEW', 'SELLER'
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSearch, setCurrentSearch] = useState(''); // 검색 버튼을 눌렀을 때의 실제 검색어

    const [reports, setReports] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0); // 전체 요소 개수

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { api } = useAuth();
    const itemsPerPage = 10; // 페이지당 항목 수 고정

    // 1. 통합 신고 목록 조회 함수 (useCallback으로 최적화 및 의존성 관리)
    const fetchReports = useCallback(async (page, type, query) => {
        setLoading(true);
        setError(null);

        // 💡 쿼리 파라미터 조합
        const params = {
            page: page - 1,
            size: itemsPerPage,
            type: type !== 'ALL' ? type : undefined, // ALL이 아니면 type 파라미터 전달
            search: query || undefined, // 검색어가 있으면 search 파라미터 전달
        };

        try {
            // 💡 통합 API 엔드포인트에 쿼리 파라미터와 함께 요청
            const response = await api.get(`/admin/reports/list`, { params });

            if (response.data && response.data.content) {
                setReports(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements); // 전체 개수 저장
                setCurrentPage(page);
            }
        } catch (err) {
            console.error("통합 신고 목록 불러오기 실패:", err);
            setError('신고 목록을 불러오는 데 실패했습니다.');
            setReports([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [api, itemsPerPage]); // api와 itemsPerPage가 변경될 때만 함수 재생성

    // 2. 검색/필터 변경 핸들러
    const handleSearch = () => {
        // 검색 버튼 클릭 시 실제 검색어를 업데이트하고 1페이지부터 다시 로딩
        setCurrentSearch(searchQuery);
        fetchReports(1, filterType, searchQuery);
    };

    const handleFilterChange = (newType) => {
        // 필터 변경 시 상태 업데이트 및 1페이지부터 다시 로딩 (검색어는 유지)
        setFilterType(newType);
        fetchReports(1, newType, currentSearch);
    };

    const handlePageChange = (page) => {
        // 페이지 변경 시 현재 필터 및 검색어 유지
        fetchReports(page, filterType, currentSearch);
    };

    // 3. 신고 처리 함수 (기존과 동일)
    const handleDeleteTarget = async (reportId, type, targetId) => {
        let confirmMessage = '';
        let url = '';
        let method = 'DELETE';

        if (type === 'REVIEW') {
            confirmMessage = `[리뷰 신고] 리뷰 ID: ${targetId} 와 모든 관련 신고를 삭제 처리하시겠습니까?`;
            url = `/report/delete/${targetId}`;
            method = 'DELETE';
        } else if (type === 'SELLER') {
            confirmMessage = `[판매자 신고] 신고 ID: ${reportId} 를 '처리 완료'로 변경하시겠습니까? (실제 판매자 제재는 별도 관리)`;
            url = `/admin/reports/seller/${reportId}/process`;
            method = 'PUT';
        } else {
            return;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            await api.request({ method: method, url: url });
            alert(`${type} 신고 처리가 성공적으로 완료되었습니다.`);
            // 처리 후 현재 페이지에서 목록 새로고침
            fetchReports(currentPage, filterType, currentSearch);
        } catch (err) {
            console.error(`${type} 신고 처리 오류:`, err);
            const msg = err.response?.data || `${type} 신고 처리 중 오류가 발생했습니다.`;
            alert(msg);
        }
    };

    // 컴포넌트 마운트 시 초기 데이터 로딩
    useEffect(() => {
        fetchReports(1, filterType, currentSearch);
    }, [fetchReports, filterType, currentSearch]); // 의존성 배열에 fetchReports 포함

    // 4. 페이지네이션 렌더링 함수 (기존과 동일)
    const renderPaginationItems = () => {
        const items = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, currentPage + 2);

        for (let number = start; number <= end; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return items;
    };

    // --- 렌더링 ---

    if (loading) return <div className="text-center mt-5">로딩 중...</div>;
    if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

    return (
        <Container className="admin-report-list mt-5">
            <h2 className="mb-4">🚨 통합 신고 접수 목록 ({totalElements}건)</h2>

            {/* 💡 검색 및 필터링 UI */}
            <Row className="mb-4 align-items-center">
                <Col md={4}>
                    <Form.Select
                        value={filterType}
                        onChange={(e) => handleFilterChange(e.target.value)}
                    >
                        <option value="ALL">전체 신고 ({totalElements})</option>
                        <option value="REVIEW">리뷰 신고</option>
                        <option value="SELLER">판매자 신고</option>
                    </Form.Select>
                </Col>
                <Col md={8}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="신고 사유, 신고자 ID 등으로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                        />
                        <Button variant="primary" onClick={handleSearch}>
                            <FaSearch className="me-1" /> 검색
                        </Button>
                    </InputGroup>
                </Col>
            </Row>

            {/* --- 신고 목록 --- */}
            {reports.length === 0 ? (
                <Alert variant="info" className="text-center">
                    선택된 조건에 해당하는 신고가 없습니다.
                </Alert>
            ) : (
                <>
                   <ListGroup className="shadow-sm">
                       {reports.map((report) => (
                           <ListGroup.Item key={`${report.type}-${report.id}`} className="d-flex justify-content-between align-items-start p-3">
                               <div className="flex-grow-1">
                                   <div className="mb-2 d-flex align-items-center">
                                       {/* 신고 유형 배지 */}
                                       <Badge bg={report.type === 'REVIEW' ? 'danger' : 'primary'} className="me-2 p-2">
                                           {report.type === 'REVIEW' ? '리뷰 신고' : '판매자 신고'}
                                       </Badge>
                                       <strong className="text-danger me-3">{report.reason}</strong>
                                       <small className="text-muted">
                                           신고 ID: {report.id} |
                                           상태: <span className={report.status === '처리 완료' ? 'text-success fw-bold' : 'text-danger fw-bold'}>{report.status || '대기'}</span>
                                       </small>
                                   </div>

                                   <Card.Text className="mb-1 small">
                                       **대상:** {report.type === 'REVIEW' ? `리뷰 ID ${report.targetId}` : `상품 ID ${report.targetId}`}
                                       (미리보기: {report.contentPreview})
                                   </Card.Text>

                                   <Card.Text className="mb-2 small text-break">
                                       **상세 사유:** {report.description}
                                   </Card.Text>

                                   <small className="text-secondary">신고자: {report.reporterId} ({new Date(report.createdAt).toLocaleString()})</small>
                               </div>
                               <div>
                                   <Button
                                       variant={report.type === 'REVIEW' ? 'danger' : 'success'}
                                       size="sm"
                                       onClick={() => handleDeleteTarget(report.id, report.type, report.targetId)}
                                       disabled={report.status === '처리 완료' && report.type === 'SELLER'}
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
                                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                {renderPaginationItems()}
                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};

export default AdminReportList;