import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { BsStar, BsStarFill } from 'react-icons/bs';
import {useAuth} from "../../contexts/AuthContext.jsx";

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const { api, user } = useAuth();

    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        if (user && user.sub) {
            setCurrentUserId(user.sub);
        }
    }, [user]);

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!currentUserId) { // 💡 사용자 ID가 없는 경우 등록 차단
            alert('사용자 정보가 없어 리뷰를 등록할 수 없습니다. 다시 로그인해주세요.');
            return;
        }
        if (rating === 0) {
            alert('별점을 선택해주세요.');
            return;
        }
        if (newReview.trim() === '') {
            alert('내용을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        const reviewData = {
            productId,
            userId: currentUserId,
            content: newReview,
            rating
        };

        formData.append('reviewData', new Blob([JSON.stringify(reviewData)], { type: 'application/json' }));

        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await api.post("/review/save", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201 || response.status === 200) {
                alert('리뷰가 성공적으로 등록되었습니다.');
                setNewReview('');
                setRating(0);
                setSelectedFiles([]);
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

            <Form.Group className="mb-3" controlId="reviewImages">
                <Form.Label>사진 추가 (최대 5장)</Form.Label>
                <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </Form.Group>

            <div className="d-grid">
                <Button variant="primary" type="submit" disabled={!currentUserId}>
                    리뷰 등록
                </Button>
            </div>
        </Form>
    );
};

export default ReviewForm;