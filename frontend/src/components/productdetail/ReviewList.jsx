import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { BsStar, BsStarFill } from 'react-icons/bs';

const ReviewList = ({ reviews }) => {
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
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <p className="text-center text-muted">아직 작성된 리뷰가 없습니다.</p>
            )}
        </>
    );
};

export default ReviewList;