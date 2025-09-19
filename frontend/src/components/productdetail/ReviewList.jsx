import React, {useState} from 'react';
import { ListGroup, Image, Button } from 'react-bootstrap'; // Button 컴포넌트 추가
import { BsStar, BsStarFill } from 'react-icons/bs';
import ReportModal from "./ReportModal.jsx";

const ReviewList = ({ reviews }) => {
    const [showReportModal, setShowReportModal] = useState(false);
    const [modalReviews, setModalReviews] = useState(null);
    const handleShow = (reviewId) => {
        setModalReviews(reviewId)
        setShowReportModal(true);
    }
    // 별점 렌더링 함수
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

    return (
        <>
            {reviews.length > 0 ? (
                <ListGroup variant="flush">
                    {reviews.map((review) => (
                        <ListGroup.Item key={review.id} className="review-item">
                            <div className="d-flex justify-content-between align-items-center">
                                <strong className="review-author">{review.userName}</strong>
                                <div>{renderStars(review.rating)}</div>
                                <small className="text-muted">{review.createdAt}</small>
                            </div>
                            <p className="review-content mt-2 mb-0">{review.content}</p>

                            {/* 이미지 목록 렌더링 */}
                            {review.imageUrls && review.imageUrls.length > 0 && (
                                <div className="review-images mt-2 d-flex flex-wrap gap-2">
                                    {review.imageUrls.map((imageUrl, index) => (
                                        <Image
                                            key={index}
                                            src={imageUrl} // 백엔드에서 제공한 이미지 URL
                                            alt={`Review Image ${index + 1}`}
                                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }}
                                            thumbnail // Bootstrap 썸네일 스타일 적용
                                        />
                                    ))}
                                </div>
                            )}
                            {/* 신고하기 버튼 추가 */}
                            <div className="d-flex justify-content-end mt-2">
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={()=> handleShow(review.id)}
                                    style={{ padding: '0', textDecoration: 'none' }}
                                >
                                    신고하기
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                    <ReportModal
                        show={showReportModal}
                        setShow={setShowReportModal}
                        // handleClose={handleClose}
                        reviewId={modalReviews}
                    />
                </ListGroup>
            ) : (
                <p className="text-center text-muted">아직 작성된 리뷰가 없습니다.</p>
            )}
        </>
    );
};

export default ReviewList;