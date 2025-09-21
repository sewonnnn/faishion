import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Image, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";

const Gemini = () => {
    // 상품 이미지 목록과 선택된 이미지, 모델 파일, 로딩 상태 등을 관리하는 state
    const { productId } = useParams();
    const [productImages, setProductImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [modelFile, setModelFile] = useState(null);
    const [resultImageUrl, setResultImageUrl] = useState("https://placehold.co/600x600/E5E7EB/A1A1AA?text=결과+이미지");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    // 컴포넌트 마운트 시 상품 이미지 목록을 API에서 가져오는 효과
    useEffect(() => {
        const fetchImages = async () => {
            try {
                let imageUrls = [];
                // productId가 존재하면 상품 상세 페이지에서 온 것으로 간주
                if (productId) {
                    // 단일 상품 이미지 가져오기 API 호출 (예상 경로)
                    const response = await axios.get(`/api/gemini/${productId}`);
                    // 응답 데이터에서 이미지 URL을 추출하여 배열에 추가
                    if (response.data && response.data.imageUrl) {
                        imageUrls.push(response.data.imageUrl);
                    }
                } else {
                    // productId가 없으면 장바구니에서 온 것으로 간주
                    // 장바구니에 있는 모든 상품 이미지 가져오기 API 호출 (예상 경로)
                    const response = await axios.get("/api/cart");
                    // 응답 데이터에서 각 상품의 이미지 URL을 추출하여 배열에 추가
                    if (response.data && Array.isArray(response.data)) {
                        imageUrls = response.data.map(item => item.product.imageUrl);
                    }
                }

                setProductImages(imageUrls);

                // 이미지가 하나만 있다면 자동으로 선택
                if (imageUrls.length === 1) {
                    setSelectedImage(imageUrls[0]);
                }
            } catch (error) {
                console.error("상품 이미지 목록 로드 중 오류 발생:", error);
                setMessage("이미지 목록을 불러오는 데 실패했습니다.");
            }
        };

        fetchImages();
    }, [productId]); // productId가 변경될 때마다 useEffect를 다시 실행

    // 파일을 Base64로 변환하는 함수
    const getBase64 = (fileOrBlob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(fileOrBlob);
        });
    };

    const handleGenerateClick = async () => {
        if (!selectedImage || !modelFile) {
            setMessage("상품 이미지와 모델 이미지를 모두 선택해주세요.");
            return;
        }
        setIsLoading(true);
        setMessage("");
        setResultImageUrl("https://placehold.co/600x600/E5E7EB/A1A1AA?text=결과+이미지");

        try {
            const dressBlob = await fetch(selectedImage).then((res) => res.blob());
            const base64Image1 = await getBase64(dressBlob);
            const base64Image2 = await getBase64(modelFile);

            const response = await axios.post("/api/gemini/generate-image", {
                image1: base64Image1,
                image2: base64Image2,
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
            console.error("이미지 생성 요청 실패:", error);
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

                        {/* 상품 이미지 선택 */}
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
                                                selectedImage === image ? "border border-primary border-4" : "border border-transparent hover-border-blue-300"
                                            }`}
                                            onClick={() => setSelectedImage(image)}
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 모델 이미지 업로드 */}
                        <div className="mb-5">
                            <h2 className="fs-5 fw-bold text-gray-700 mb-3">모델 이미지 업로드</h2>
                            <Form.Group className="position-relative border border-dashed rounded-4 p-4 text-center d-flex justify-content-center align-items-center" style={{ minHeight: '160px', backgroundColor: '#F9FAFB' }}>
                                {modelFile ? (
                                    <Image src={URL.createObjectURL(modelFile)} alt="모델 이미지 미리보기" fluid rounded className="object-contain" style={{ maxHeight: '160px' }} />
                                ) : (
                                    <Form.Label className="text-gray-500 cursor-pointer mb-0">
                                        이미지를 업로드하려면 클릭하세요
                                    </Form.Label>
                                )}
                                <Form.Control type="file" accept="image/*" className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" onChange={(e) => setModelFile(e.target.files[0])} />
                            </Form.Group>
                        </div>

                        <Button variant="primary" className="w-100 py-3 rounded-pill fw-bold" onClick={handleGenerateClick} disabled={isLoading}>
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

                    {/* Right Side: Result */}
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
