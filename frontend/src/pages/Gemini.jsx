import React, { useState, useEffect, useRef } from "react"; // useRef 추가
import { Container, Row, Col, Form, Button, Image, Spinner } from "react-bootstrap";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import axios from "axios";
import {useAuth} from "../contexts/AuthContext.jsx";

const Gemini = () => {
    // ... (기존 상태 및 훅 선언)
    const { productId } = useParams();
    const [searchParams] = useSearchParams();
    const [productImages, setProductImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [modelImageUrl, setModelImageUrl] = useState(null);
    const [resultImageUrl, setResultImageUrl] = useState("https://placehold.co/600x600/E5E7EB/A1A1AA?text=결과+이미지");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const {api} = useAuth();
    const nav = useNavigate();

    // ⭐ useRef를 사용하여 첫 실행을 추적
    const isMounted = useRef(false);

    useEffect(() => {
        // Strict Mode에서 두 번 실행되는 것을 방지
        if (isMounted.current) {
            return;
        }
        isMounted.current = true;

        const fetchImages = async () => {
            let userImageUrl = null;
            let imageUrls = [];

            try {
                const BASE_URL = "http://localhost:8080";
                const stockIds = searchParams.get("stockIds");

                if (stockIds) {
                    const apiUrl = `${BASE_URL}/gemini/cart-images?ids=${stockIds}`;
                    const response = await api.get(apiUrl);
                    if (response.data) {
                        if (Array.isArray(response.data.imageUrls)) {
                            imageUrls = response.data.imageUrls.map(url => `${BASE_URL}${url}`);
                        }
                        userImageUrl = response.data.userImageUrl ? `${BASE_URL}${response.data.userImageUrl}` : null;
                    }
                } else if (productId) {
                    const apiUrl = `${BASE_URL}/gemini/${productId}`;
                    const response = await api.get(apiUrl);

                    if (response.data) {
                        if (response.data.imageUrl) {
                            imageUrls.push(`${BASE_URL}${response.data.imageUrl}`);
                        }
                        userImageUrl = response.data.userImageUrl ? `${BASE_URL}${response.data.userImageUrl}` : null;
                    }
                }

                // ⭐ 사용자 이미지 부재 시 알림/이동 (로직 자체는 유지)
                if(!userImageUrl){
                    alert("AI 스타일링을 위해서는 마이페이지에서 본인의 이미지를 등록해야합니다.");
                    nav("/mypage/detail");
                    return; // 함수 종료
                }

                // 정상 상태 업데이트
                setProductImages(imageUrls);
                setModelImageUrl(userImageUrl);

                if (imageUrls.length === 0) {
                    setMessage("이미지 목록을 불러오는 데 실패했거나 이미지가 없습니다.");
                }

            } catch (error) {
                console.error("[프런트엔드] 이미지 목록 로드 중 오류 발생:", error);
                setMessage("이미지 목록을 불러오는 데 실패했습니다.");
            }
        };

        fetchImages();
        // 의존성 배열은 그대로 유지하지만, Strict Mode 재실행은 useRef로 제어
    }, [productId, searchParams, api, nav]);

    // ... (나머지 handleImageToggle, getBase64, handleGenerateClick 함수는 동일)
    const handleImageToggle = (image) => {
        setSelectedImages(prevImages => {
            if (prevImages.includes(image)) {
                return prevImages.filter(item => item !== image);
            } else {
                return [...prevImages, image];
            }
        });
    };

    const getBase64 = (fileOrBlob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(fileOrBlob);
        });
    };

    const handleGenerateClick = async () => {
        if (selectedImages.length === 0 || !modelImageUrl) {
            setMessage("상품 이미지와 모델 이미지를 모두 선택해주세요.");
            return;
        }

        setIsLoading(true);
        setMessage("");
        setResultImageUrl("https://placehold.co/600x600/E5E7EB/A1A1AA?text=결과+이미지");

        try {
            const base64ImagePromises = selectedImages.map(async (image) => {
                const dressBlob = await fetch(image).then((res) => res.blob());
                return getBase64(dressBlob);
            });
            const base64Images = await Promise.all(base64ImagePromises);

            // 모델 이미지 URL을 Blob으로 변환하여 Base64로 인코딩
            const modelBlob = await fetch(modelImageUrl).then(res => res.blob());
            const base64ModelImage = await getBase64(modelBlob);

            const response = await api.post("/gemini/generate-image", {
                image1: base64Images,
                image2: base64ModelImage,
            });

            const responseData = response.data;

            if (responseData.error) {
                setMessage(`오류: ${responseData.error}`);
            } else if (responseData.base64Data) {
                setResultImageUrl(`data:image/png;base64,${responseData.base64Data}`);
                setMessage("이미지 생성 완료!");
            } else {
                setMessage("알 수 없는 응답 형식입니다.");
            }
        } catch (error) {
            console.error("[프런트엔드] 이미지 생성 요청 실패:", error.message);
            setMessage("이미지 생성 요청 실패: 서버와의 통신 문제");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F3F4F6' }} className="min-vh-100 py-5 d-flex align-items-center justify-content-center font-sans">
            <Container className="bg-white rounded-4 shadow-lg p-5" style={{ maxWidth: '1200px' }}>
                <Row className="g-5">
                    <Col md={6} className="d-flex flex-column">
                        <h1 className="text-center fw-bolder text-gray-800 mb-2">AI 패션 스타일러</h1>
                        <p className="text-center text-gray-500 mb-5">장바구니에 담긴 상품을 모델 이미지에 입혀 보세요.</p>
                        <div className="mb-5">
                            <h2 className="fs-5 fw-bold text-gray-700 mb-3">상품 이미지 선택</h2>
                            <div className="d-flex flex-wrap gap-3">
                                {productImages.length === 0 ? (
                                    <p className="text-gray-400 text-center w-100 m-0">장바구니에 상품이 없습니다.</p>
                                ) : (
                                    productImages.map((image, index) => (
                                        <Image
                                            key={index}
                                            src={image}
                                            alt={`상품 이미지 ${index + 1}`}
                                            fluid
                                            rounded
                                            className={`shadow-sm transition-all duration-200 cursor-pointer hover-shadow-lg ${
                                                selectedImages.includes(image) ? "border border-primary border-4" : "border border-transparent hover-border-blue-300"
                                            }`}
                                            onClick={() => handleImageToggle(image)}
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="mb-5">
                            <h2 className="fs-5 fw-bold text-gray-700 mb-3">모델 이미지</h2>
                            <div className="border border-dashed rounded-4 p-4 text-center d-flex justify-content-center align-items-center" style={{ minHeight: '160px', backgroundColor: '#F9FAFB' }}>
                                {modelImageUrl ? (
                                    <Image src={modelImageUrl} alt="모델 이미지" fluid rounded className="object-contain" style={{ maxHeight: '160px' }} />
                                ) : (
                                    <p className="text-gray-500 mb-0">사용자 이미지를 불러오는 중...</p>
                                )}
                            </div>
                        </div>
                        <Button variant="primary" className="w-100 py-3 rounded-pill fw-bold" onClick={handleGenerateClick} disabled={isLoading || selectedImages.length === 0 || !modelImageUrl}>
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
                        <h2 className="fs-4 fw-bold text-gray-700 mb-4 text-center">완성된 이미지</h2>
                        <div className="w-100 bg-white rounded-3 shadow-sm d-flex justify-content-center align-items-center" style={{ aspectRatio: '1 / 1' }}>
                            {isLoading ? (
                                <div className="d-flex flex-column align-items-center text-primary">
                                    <Spinner animation="border" role="status" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                                    <p className="mt-2 text-muted">이미지 생성 중...</p>
                                </div>
                            ) : (
                                <Image src={resultImageUrl} alt="결과 이미지" fluid rounded className="object-contain" />
                            )}
                        </div>
                        {message && (
                            <div className="mt-4 text-sm fw-medium text-center text-blue-600">
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