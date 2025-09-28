import React, { useState, useEffect, useCallback } from 'react';
import { ListGroup, Image, Button, Pagination, Modal } from 'react-bootstrap';
import { BsStar, BsStarFill } from 'react-icons/bs';
import axios from 'axios';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

// 마이페이지용 리뷰 리스트 컴포넌트
const MyReviewList = () => {
    const { api } = useAuth();
    const nav = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} style={{ color: '#ffc107' }}>
                    {i <= rating ? <BsStarFill /> : <BsStar />}
                </span>
            );
        }
        return stars;
    };

    const fetchMyReviews = useCallback(async (page) => {

        const pageToFetch = page || currentPage;

        try {

            const response = await api.get(`/review/my-reviews?page=${pageToFetch - 1}&size=10`);

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
    }, [currentPage, api]); // 의존성 유지

    useEffect(() => {
        fetchMyReviews();
    }, [fetchMyReviews]);


    useEffect(() => {
        fetchMyReviews();
    }, [fetchMyReviews]);

    // 리뷰 쓴 상품으로 이동하는 함수
    const onProductForm = (productId) => {
        nav(`/product/${productId}`);
    }

    // 페이지네이션 항목 렌더링 함수
    const renderPaginationItems = () => {
        const items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
                    {number}
                </Pagination.Item>
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

           await fetchMyReviews(1);
           // fetchMyReviews 내부에서 setCurrentPage(1)이 실행되어 상태가 업데이트됩니다.

       } catch (error) {
           console.error("리뷰 삭제 API 호출 실패:", error);
           alert(`리뷰 삭제에 실패했습니다. (오류: ${error.response?.status || '서버 연결 실패'})`);
       }
   };

    return (
        <>
            <h2 className="mb-4">내가 작성한 리뷰</h2>
            {reviews.length > 0 ? (
                <>
                    <ListGroup variant="flush">
                        {reviews.map((review) => (
                            <ListGroup.Item
                                key={review.id}
                                className="review-item cursor-pointer shadow-sm mb-3"
                                onClick={() => onProductForm(review.productId)}
                                style={{
                                    transition: 'box-shadow 0.3s ease-in-out',
                                    cursor: 'pointer',
                                    borderRadius: '5px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'}
                            >
                                {/* 상단: 상품명 및 별점/날짜 */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <strong className="review-product-name text-primary fs-5">{review.productName || "상품 정보 없음"}</strong>
                                    <div className="d-flex flex-column align-items-end">
                                        <div>{renderStars(review.rating)}</div>
                                        <small className="text-muted mt-1">{review.createdAt}</small>
                                    </div>
                                </div>

                                {/* 이미지와 내용을 수평으로 배치 */}
                                <div className="d-flex align-items-start">
                                    {review.imageUrls && review.imageUrls.length > 0 && (
                                        <div className="review-images me-4 flex-shrink-0">
                                            <Image
                                                src={review.imageUrls[0]}
                                                alt={`Review Image`}
                                                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                                                thumbnail
                                            />
                                        </div>
                                    )}
                                    <p className="review-content text-break mb-0 flex-grow-1 pt-1" style={{ fontSize: '1.05rem' }}>
                                        {review.content}
                                    </p>
                                </div>

                                {/* 하단: 버튼 섹션 - 삭제 버튼 추가 */}
                                <div className="d-flex justify-content-end gap-3 mt-3">
                                    {/* 🎯 삭제 버튼 */}
                                    <Button
                                        variant="outline-danger" // 삭제 버튼 스타일
                                        size="sm"
                                        onClick={(e) => handleDeleteClick(e, review.id)}
                                    >
                                        삭제
                                    </Button>

                                    {/* 상품 페이지 이동 버튼 */}
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onProductForm(review.productId);
                                        }}
                                        style={{ padding: '0', textDecoration: 'none' }}
                                    >
                                        상품 페이지로 이동
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {/* 페이지네이션 UI는 그대로 유지 */}
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                            <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                            {renderPaginationItems()}
                            <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                        </Pagination>
                    </div>
                </>
            ) : (
                <p className="text-center text-muted">아직 작성한 리뷰가 없습니다.</p>
            )}

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
        </>
    );
};

export default MyReviewList;