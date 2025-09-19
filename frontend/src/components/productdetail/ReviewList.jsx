import React from 'react';
import { ListGroup, Image, Button } from 'react-bootstrap'; // Button 컴포넌트 추가
import { BsStar, BsStarFill } from 'react-icons/bs';
import axios from "axios";

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

    // 신고하기 버튼 클릭 핸들러
    const handleReport = async (reviewId) => {
        console.log(`리뷰 ID ${reviewId}를 신고합니다.`);
        try {
            // 비동기 요청을 기다림
            const response = await axios.get(`/api/review/isReported/${reviewId}`);

            // 서버에서 반환하는 데이터(true/false)에 따라 로직 처리
            if (response.data) {
                console.log("신고에 성공했습니다.");
                alert(`리뷰 ID ${reviewId}가 신고되었습니다.`);
            } else {
                console.log("신고 실패");
                alert(`리뷰 ID ${reviewId} 신고에 실패했습니다.`);
            }
        } catch (error) {
            // 네트워크 오류, 서버 오류 등 예외 처리
            console.error("신고 중 오류 발생:", error);
            alert("신고 처리 중 오류가 발생했습니다.");
        }
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
                                    onClick={() => handleReport(review.id)}
                                    style={{ padding: '0', textDecoration: 'none' }}
                                >
                                    신고하기
                                </Button>
                            </div>
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