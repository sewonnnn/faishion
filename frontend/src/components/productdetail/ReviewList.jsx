// ReviewList.jsx
import React, { useState, useEffect } from 'react';
import { ListGroup, Image, Button, Pagination } from 'react-bootstrap';
import { BsStar, BsStarFill } from 'react-icons/bs';
import ReportModal from "./ReportModal.jsx";
import axios from 'axios';

// productId를 props로 받도록 변경
const ReviewList = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showReportModal, setShowReportModal] = useState(false);
    const [modalReviews, setModalReviews] = useState(null);

    const handleShow = (reviewId) => {
        setModalReviews(reviewId);
        setShowReportModal(true);
    };

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

    // productId 또는 currentPage가 변경될 때마다 리뷰 목록을 불러옴
    useEffect(() => {
        if (!productId) return;

        const fetchReviews = async () => {
            try {
                const response = await axios.get(`/api/review/${productId}?page=${currentPage - 1}&size=10`);

                // 데이터 구조가 예상과 다른 경우를 대비해 방어 코드 추가
                if (response.data && response.data.content) {
                    const { content, totalPages } = response.data;
                    setReviews(content);
                    setTotalPages(totalPages);
                } else {
                    setReviews([]);
                    setTotalPages(1);
                }
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                setReviews([]);
                setTotalPages(1);
            }
        };

        fetchReviews();
    }, [productId, currentPage]);
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

    return (
        <>
            {reviews.length > 0 ? (
                <>
                    <ListGroup variant="flush">
                        {reviews.map((review) => (
                            <ListGroup.Item key={review.id} className="review-item">
                                <div className="d-flex justify-content-between align-items-center">
                                    <strong className="review-author">{review.userName}</strong>
                                    <div>{renderStars(review.rating)}</div>
                                    <small className="text-muted">{review.createdAt}</small>
                                </div>
                                <p className="review-content mt-2 mb-0">{review.content}</p>
                                {review.imageUrls && review.imageUrls.length > 0 && (
                                    <div className="review-images mt-2 d-flex flex-wrap gap-2">
                                        {review.imageUrls.map((imageUrl, index) => (
                                            <Image
                                                key={index}
                                                src={imageUrl}
                                                alt={`Review Image ${index + 1}`}
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }}
                                                thumbnail
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="d-flex justify-content-end mt-2">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleShow(review.id)}
                                        style={{ padding: '0', textDecoration: 'none' }}
                                    >
                                        신고하기
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {/* 페이지네이션 UI 추가 */}
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                            <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                            {renderPaginationItems()}
                            <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                        </Pagination>
                    </div>

                    <ReportModal
                        show={showReportModal}
                        setShow={setShowReportModal}
                        reviewId={modalReviews}
                    />
                </>
            ) : (
                <p className="text-center text-muted">아직 작성된 리뷰가 없습니다.</p>
            )}
        </>
    );
};

export default ReviewList;