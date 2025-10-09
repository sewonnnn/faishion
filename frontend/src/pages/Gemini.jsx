import React, { useState, useEffect, useRef } from "react"; // useRef 추가
import { Container, Row, Col, Form, Button, Image, Spinner } from "react-bootstrap";
import {useNavigate, useLocation } from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.jsx";

const Gemini = () => {
    const { state } = useLocation();
    const [selectedImageIds, setSelectedImageIds] = useState([]);
    const userImageId = useRef(null);
    const [resultImageId, setResultImageId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const {api} = useAuth();
    const nav = useNavigate();
    const isMounted = useRef(false);

    useEffect(() => {
        // Strict Mode에서 두 번 실행되는 것을 방지
        if (isMounted.current) {
            return;
        }
        isMounted.current = true;

        const userImage = async () => {
            try{
                const userResponse = await api.get('/user/');
                if(!userResponse.data.image){
                    alert("AI 스타일링을 위해서는 마이페이지에서 본인의 이미지를 등록해야합니다.");
                    nav("/mypage/detail");
                    return;
                }
                userImageId.current = userResponse.data.image.id;
                setResultImageId(userImageId.current);
                setMessage("");
            }catch (error) {
                console.error("유저 이미지 로드 중 오류 발생:", error);
                setMessage("이미지를 불러오는 데 실패했습니다.");
            }
        }
        userImage();
    }, [api, nav]);

    const handleImageToggle = (imageId) => {
        setSelectedImageIds(prevImageIds => {
            if (prevImageIds.includes(imageId)) {
                return prevImageIds.filter(item => item !== imageId);
            } else {
                return [...prevImageIds, imageId];
            }
        });
    };

    const handleGenerateClick = async () => {
        if (!userImageId){
            setMessage("프로필 이미지가 없습니다.");
            return;
        }
        if (selectedImageIds.length === 0) {
            setMessage("상품 이미지를 선택해주세요.");
            return;
        }
        setIsLoading(true);
        setMessage("");
        setResultImageId(userImageId.current);
        try {
            const generationResponse = await api.post("/image/generate",
                {
                    imageIds: [userImageId.current, ...selectedImageIds],
                    customPrompt : "The images I have attached are referred to as **Image 1, followed by Image 2 through Image n, in the order they were provided. CRITICAL: The face of the person in Image 1 must be kept absolutely identical to its original appearance in Image 1, without any modification, alteration, or deviation whatsoever**. Image 1 is a full-body image of a person. Images 2 through n contain individual or complete fashion items. Create a single, high-resolution, photorealistic, front-facing, full-body image of the person from Image 1, explicitly showing them wearing and fully styled with all the fashion items from Images 2 through n. **Ensure the fit, design, color, texture, and every visual detail of each clothing item are 100% identical and perfectly accurate to their source images (Images 2 through n), and exclude any clothing or accessories from Image 1 itself.** The final image should have a **plain white background only, with no other environmental elements or stylistic feels from the source images.** Maintain realistic fit, natural proportions, high-quality textures, and appropriate lighting around the preserved face."
                }
            );
            setResultImageId(generationResponse.data.id);
            setMessage("이미지 생성 완료!");
        } catch (error) {
            console.error("이미지 생성 요청 실패:", error.message);
            setMessage("이미지 생성 요청 실패: 서버와의 통신 문제");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F3F4F6' }} className="py-5 d-flex align-items-center justify-content-center font-sans">
            <Container className="bg-white rounded-4 shadow-lg p-5" style={{ maxWidth: '1200px' }}>
                <Row className="g-5">
                    <Col md={6} className="d-flex flex-column" style={{ minHeight: '60vh' }}>
                        <div className="flex-grow-1 d-flex flex-column">
                            <h1 className="text-center fw-bolder text-gray-800 mb-2">AI 패션 스타일러</h1>
                            <p className="text-center text-gray-500 mb-5">장바구니에 담긴 상품을 모델 이미지에 입혀 보세요.</p>
                            <div className="mb-4 flex-grow-1" style={{ overflowY: 'auto', maxHeight: '50vh' }}>
                                <h2 className="fs-5 fw-bold text-gray-700 mb-3">상품 이미지 선택</h2>
                                <div className="d-flex flex-wrap gap-3">
                                    {state && state.length === 0 ? (
                                        <p className="text-gray-400 text-center w-100 m-0">장바구니에 상품이 없습니다.</p>
                                    ) : (
                                        state && state.map((imageId, index) => (
                                            <Image
                                                key={imageId}
                                                src={`${api.defaults.baseURL}/image/${imageId}`}
                                                alt={`상품 이미지 ${index + 1}`}
                                                fluid
                                                rounded
                                                className={`shadow-sm transition-all duration-200 cursor-pointer hover-shadow-lg ${
                                                    selectedImageIds.includes(imageId) ? "border border-primary border-4" : "border border-transparent hover-border-blue-300"
                                                }`}
                                                onClick={() => handleImageToggle(imageId)}
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="primary" className="w-100 py-3 rounded-pill fw-bold mt-4" onClick={handleGenerateClick} disabled={isLoading || selectedImageIds.length === 0 || !userImageId}>
                            {isLoading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    생성 중...
                                </>
                            ) : (
                                "이미지 생성하기"
                            )}
                        </Button>
                    </Col>

                    <Col md={6} className="d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: '#E5E7EB', borderRadius: '1rem' }}>
                        <h2 className="fs-4 fw-bold text-gray-700 mb-4 text-center">모델 이미지</h2>
                        <div
                            className="w-100 bg-white rounded-3 shadow-sm d-flex justify-content-center align-items-center position-relative mb-4"
                            style={{ aspectRatio: '1 / 1' }}
                        >
                            <Image
                                src={`${api.defaults.baseURL}/image/${resultImageId}`}
                                alt="결과 이미지"
                                fluid rounded
                                className="object-contain"
                            />
                            {isLoading && (
                                <div
                                    className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center text-primary"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                        borderRadius: '0.3rem',
                                        zIndex: 10
                                    }}
                                >
                                    <Spinner animation="border" role="status" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                                    <p className="mt-2 text-muted">이미지 생성 중...</p>
                                </div>
                            )}
                        </div>
                        {message && (
                            <div className="text-sm fw-medium text-center text-blue-600">
                                {message}
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Gemini;