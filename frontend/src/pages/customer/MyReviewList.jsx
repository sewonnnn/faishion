import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Pagination, Modal } from 'react-bootstrap'; // Image, ListGroup 제거
import { BsStar, BsStarFill } from 'react-icons/bs';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import '../../pages/NoticeListPage.css'; // 공지사항 스타일을 재사용한다고 가정

// 마이페이지용 리뷰 리스트 컴포넌트
const MyReviewList = () => {
    const { api } = useAuth();
    const nav = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // 1부터 시작
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const pageSize = 10; // 한 페이지당 게시물 수 (API 호출과 일치)

    // 별점 렌더링 함수 (유지)
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} style={{ color: '#888', fontSize: '1.2em' }}>
                    {i <= rating ? <BsStarFill /> : <BsStar />}
                </span>
            );
        }
        return stars;
    };

    // 리뷰 데이터 패치 함수 (currentPage 의존성 제거 및 page 파라미터 활용)
    const fetchMyReviews = useCallback(async (page) => {
        // 서버는 0부터 시작하는 페이지 번호를 원하므로 pageToFetch - 1
        const pageToFetch = page || currentPage;

        try {
            const response = await api.get(`/review/my-reviews?page=${pageToFetch - 1}&size=${pageSize}`);

            if(page) {
                setCurrentPage(page);
            }

            if (response.data && response.data.content) {
                const { content, totalPages } = response.data;
                setReviews(content);
                setTotalPages(totalPages);
            } else {
                setReviews([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("나의 리뷰 목록을 불러오는 중 오류 발생:", error);
            setReviews([]);
            setTotalPages(1);
        }
    }, [api, pageSize, currentPage]); // currentPage를 의존성에 유지하여 useEffect에서 초기 호출을 보장

    // 최초 로드 및 페이지 변경 시 데이터 호출
    useEffect(() => {
        fetchMyReviews();
    }, [fetchMyReviews]);

    // 리뷰 쓴 상품으로 이동하는 함수 (유지)
    const onProductForm = (productId) => {
        nav(`/product/${productId}`);
    }

    // 페이지 변경 핸들러
    const handlePageChange = (pageNum) => {
        fetchMyReviews(pageNum);
    };

    // 페이지네이션 항목 렌더링 함수 (NoticeListPage와 유사하게 수정)
    const renderPaginationItems = () => {
        const items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    disabled={number === currentPage}
                >
                    {number}
                </button>
            );
        }
        return items;
    };

    const handleDeleteClick = (e, reviewId) => {
        e.stopPropagation(); // 부모 항목 클릭 방지
        setReviewToDelete(reviewId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;

        try {
            await api.delete(`/review/${reviewToDelete}`);

            alert("리뷰가 삭제되었습니다.");
            setShowDeleteModal(false);
            setReviewToDelete(null);

            // 삭제 후 첫 페이지 (1)로 다시 로드
            await fetchMyReviews(1);

        } catch (error) {
            console.error("리뷰 삭제 API 호출 실패:", error);
            alert(`리뷰 삭제에 실패했습니다. (오류: ${error.response?.status || '서버 연결 실패'})`);
        }
    };

    // 날짜 포맷팅 함수 (NoticeListPage 참고)
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\. /g, '.').slice(0, -1);
    };


    return (
        <section className="notice"> {/* NoticeListPage의 섹션 클래스 재사용 */}
            <Container className="notice-inner"> {/* NoticeListPage의 내부 컨테이너 클래스 재사용 */}
                <h1 className="notice-title">내가 작성한 리뷰</h1>

                <div className="notice-actions" style={{ justifyContent: 'flex-end' }}>
                    {/* NoticeListPage와 달리 검색 기능은 제외하고, 필요하다면 리뷰 목록 상단에 간략한 안내만 배치 */}
                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                        작성한 리뷰를 확인하고 관리할 수 있습니다.
                    </p>
                </div>

                <table className="notice-table">
                    <colgroup>
                        <col style={{width: '8%'}}/>
                        <col style={{width: '35%'}}/>
                        <col style={{width: '25%'}}/>
                        <col style={{width: '15%'}}/>
                        <col style={{width: '17%'}}/>
                    </colgroup>
                    <thead>
                    <tr>
                        <th className="text-center">No</th>
                        <th className="text-center">상품명 / 리뷰내용</th>
                        <th className="text-center">평점</th>
                        <th className="text-center">작성일</th>
                        <th className="text-center">관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => {
                            // 페이지 번호와 배열 인덱스를 더해 전체 순번 계산 (NoticeListPage 방식)
                            const sequentialNumber = ((currentPage - 1) * pageSize) + (index + 1);

                            return (
                                <tr
                                    key={review.id}
                                    onClick={() => onProductForm(review.productId)}
                                >
                                    <td className="text-center">{sequentialNumber}</td>
                                    <td className="subject text-start">
                                        <div style={{ fontWeight: 600 }}>{review.productName || "상품 정보 없음"}</div>
                                        {/* 리뷰 내용을 간략하게 표시 */}
                                        <div className="text-muted mt-1" style={{ fontSize: '0.9em' }}>
                                            {review.content.length > 50 ? review.content.substring(0, 50) + '...' : review.content}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        {renderStars(review.rating)}
                                    </td>
                                    <td className="text-center">
                                        {formatDate(review.createdAt)}
                                    </td>
                                    <td className="text-center">
                                        {/* 삭제 버튼 */}
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={(e) => handleDeleteClick(e, review.id)}
                                            // NoticeListPage의 .btn-write 스타일을 활용하고 싶다면 className="btn-write"를 사용하고 CSS 조정 필요
                                        >
                                            삭제
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center" style={{ padding: '30px 16px', color: 'var(--muted)' }}>
                                아직 작성한 리뷰가 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {/* 페이징 버튼 (NoticeListPage와 동일한 HTML 구조 및 클래스 사용) */}
                {totalPages > 1 && (
                    <div className="pagination">
                        {/* NoticeListPage는 버튼 배열을 직접 렌더링하므로, 해당 방식을 따릅니다. */}
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                disabled={i + 1 === currentPage}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </Container>

            {/* 모달 (기존 유지) */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>리뷰 삭제 확인</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    정말로 이 리뷰를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        취소
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        삭제
                    </Button>
                </Modal.Footer>
            </Modal>
        </section>
    );
};

export default MyReviewList;