import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { BsStar, BsStarFill } from 'react-icons/bs';
import axios from 'axios';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('별점을 선택해주세요.');
            return;
        }
        if (newReview.trim() === '') {
            alert('내용을 입력해주세요.');
            return;
        }

        const reviewData = {
            productId,
            content: newReview,
            rating
        };

        try {
            const response = await axios.post("/api/review/save", reviewData);
            if (response.status === 201 || response.status === 200) {
                alert('리뷰가 성공적으로 등록되었습니다.');
                setNewReview('');
                setRating(0);
                onReviewSubmitted();
            }
        } catch (error) {
            console.error('리뷰 등록에 실패했습니다:', error.response ? error.response.data : error);
            alert('리뷰 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    const renderStars = (isEditable = false) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const isFilled = isEditable ? (i <= (hoverRating || rating)) : (i <= rating);
            stars.push(
                <span
                    key={i}
                    style={{ cursor: isEditable ? 'pointer' : 'default', color: '#ffc107' }}
                    onClick={() => isEditable && setRating(i)}
                    onMouseEnter={() => isEditable && setHoverRating(i)}
                    onMouseLeave={() => isEditable && setHoverRating(0)}
                >
                    {isFilled ? <BsStarFill /> : <BsStar />}
                </span>
            );
        }
        return stars;
    };

    return (
        <Form onSubmit={handleReviewSubmit} className="mb-4">
            <Form.Group className="mb-3" controlId="reviewForm">
                <Form.Label>리뷰 작성</Form.Label>
                <div className="mb-2">
                    {renderStars(true)}
                </div>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="상품에 대한 솔직한 리뷰를 작성해주세요."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                />
            </Form.Group>
            <div className="d-grid">
                <Button variant="primary" type="submit">
                    리뷰 등록
                </Button>
            </div>
        </Form>
    );
};

export default ReviewForm;
