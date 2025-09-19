import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { BsStar, BsStarFill } from 'react-icons/bs';
import axios from 'axios';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        console.log('--- 리뷰 제출 시작 ---'); // 콘솔 로그
        console.log('productId:', productId);
        console.log('newReview:', newReview);
        console.log('rating:', rating);
        console.log('selectedFiles:', selectedFiles);

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
            userId: 'sewon',
            content: newReview,
            rating
        };

        formData.append('reviewData', new Blob([JSON.stringify(reviewData)], { type: 'application/json' }));

        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            console.log('axios POST 요청을 보냅니다.'); // 콘솔 로그
            const response = await axios.post("/api/review/save", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('--- 리뷰 등록 성공 ---'); // 콘솔 로그
            console.log('응답 상태:', response.status);
            console.log('응답 데이터:', response.data);

            if (response.status === 201 || response.status === 200) {
                alert('리뷰가 성공적으로 등록되었습니다.');
                setNewReview('');
                setRating(0);
                setSelectedFiles([]);
                onReviewSubmitted();
            }
        } catch (error) {
            console.log('--- 리뷰 등록 실패 ---'); // 콘솔 로그
            console.error('리뷰 등록에 실패했습니다:', error.response ? error.response.data : error);
            alert('리뷰 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    // ... (renderStars 함수 및 return문은 기존과 동일) ...
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
                <Button variant="primary" type="submit">
                    리뷰 등록
                </Button>
            </div>
        </Form>
    );
};

export default ReviewForm;