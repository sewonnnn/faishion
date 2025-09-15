import { useRef, useState } from "react";
import { Container, Row, Col, Form, Button, Image } from "react-bootstrap"; // React Bootstrap 컴포넌트 임포트
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS 임포트

const Gemini = () => {
    const [dressImage, setDressImage] = useState(null);
    const [modelImage, setModelImage] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [resultImageUrl, setResultImageUrl] = useState('https://placehold.co/600x600/E5E7EB/A1A1AA?text=결과+이미지');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', color: '' });

    const file1InputRef = useRef(null);
    const file2InputRef = useRef(null);

    // 파일 미리보기 기능
    const handleFileChange = (event, setImageState) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageState(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageState(null);
        }
    };

    // 이미지를 Base64로 변환하는 함수
    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    // 상태 메시지 표시 함수
    const showMessage = (text, color) => {
        setMessage({ text, color });
    };

    // 이미지 생성 요청
    const handleGenerateClick = async () => {
        const file1 = file1InputRef.current?.files[0];
        const file2 = file2InputRef.current?.files[0];

        if (!file1 || !file2 || !prompt) {
            // Bootstrap danger color 클래스 사용
            showMessage('드레스 이미지, 모델 이미지, 프롬프트를 모두 입력해주세요.', 'text-danger');
            return;
        }

        setIsLoading(true);
        showMessage('', ''); // 이전 메시지 초기화
        setResultImageUrl('https://placehold.co/600x600/E5E7EB/A1A1AA?text=결과+이미지'); // 기본 이미지로 초기화

        try {
            console.log("--- 이미지 생성 요청 시작 ---");
            console.log("1. 이미지 파일을 Base64로 변환 중...");
            const base64Image1 = await getBase64(file1);
            const base64Image2 = await getBase64(file2);
            console.log("2. Base64 변환 완료. 서버로 요청 전송 준비 완료.");

            // 실제 API 호출 부분 (fetch('/generate-image', ...))
            // 이 부분은 실제 백엔드 API 엔드포인트에 맞게 수정해야 합니다.
            // 예시: const response = await fetch('YOUR_API_ENDPOINT/generate-image', { ... });
            console.log("3. 서버에 POST 요청 전송 (시뮬레이션)...");
            // 실제 fetch 요청 대신 시뮬레이션을 위한 setTimeout 사용
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기 시뮬레이션

            // 실제 API 응답을 가정하여 더미 데이터 생성
            const simulatedResponseData = {
                base64Data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // 빈 이미지 Base64 (실제로는 생성된 이미지 데이터)
            };
            console.log("4. 서버 응답 수신 (시뮬레이션 완료).");
            console.log("5. JSON 데이터 파싱 완료:", simulatedResponseData);

            if (simulatedResponseData.error) {
                console.error("6. 서버에서 오류 반환:", simulatedResponseData.error);
                // Bootstrap danger color 클래스 사용
                showMessage(`오류: ${simulatedResponseData.error}`, 'text-danger');
            } else if (simulatedResponseData.base64Data) {
                console.log("6. Base64 이미지 데이터 수신 성공!");
                setResultImageUrl(`data:image/png;base64,${simulatedResponseData.base64Data}`);
                // Bootstrap success color 클래스 사용
                showMessage('이미지 생성 완료!', 'text-success');
            } else {
                console.error("6. 알 수 없는 응답 형식:", simulatedResponseData);
                // Bootstrap warning color 클래스 사용
                showMessage('알 수 없는 응답 형식입니다.', 'text-warning');
            }

        } catch (error) {
            console.error("7. 네트워크 또는 예상치 못한 오류 발생:", error);
            // Bootstrap danger color 클래스 사용
            showMessage('이미지 생성 요청 실패: 서버와의 통신 문제', 'text-danger');
        } finally {
            setIsLoading(false);
            console.log("--- 이미지 생성 요청 종료 ---");
        }
    };

    return (
        <Container className="my-5">
            <h1 className="text-center mb-4 fw-bold">AI 패션 스타일러</h1>
            <p className="text-center text-muted mb-5">
                두 이미지를 합쳐 새로운 패션 사진을 생성합니다.
            </p>
            <Row className="g-4"> {/* Bootstrap gutter for spacing */}
                {/* 이미지 업로드 및 미리보기 컨테이너 */}
                <Col md={6}> {/* Half width on medium screens and up */}
                    <div className="d-flex flex-column gap-3">
                        {/* 드레스 이미지 업로드 */}
                        <div className="border border-dashed rounded p-3 text-center position-relative overflow-hidden cursor-pointer" style={{ minHeight: '150px' }}>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                onChange={(e) => handleFileChange(e, setDressImage)}
                                ref={file1InputRef}
                            />
                            <label className="form-label text-muted mb-0">드레스 이미지 업로드</label>
                            {dressImage && (
                                <Image
                                    src={dressImage}
                                    alt="Dress Preview"
                                    className="mt-3 w-100 h-auto rounded object-contain"
                                    style={{ maxHeight: '150px' }}
                                />
                            )}
                        </div>
                        {/* 모델 이미지 업로드 */}
                        <div className="border border-dashed rounded p-3 text-center position-relative overflow-hidden cursor-pointer" style={{ minHeight: '150px' }}>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                onChange={(e) => handleFileChange(e, setModelImage)}
                                ref={file2InputRef}
                            />
                            <label className="form-label text-muted mb-0">모델 이미지 업로드</label>
                            {modelImage && (
                                <Image
                                    src={modelImage}
                                    alt="Model Preview"
                                    className="mt-3 w-100 h-auto rounded object-contain"
                                    style={{ maxHeight: '150px' }}
                                />
                            )}
                        </div>
                    </div>
                    {/* 프롬프트 입력 */}
                    <div className="mt-4">
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="예시: 이 모델에게 드레스를 입히고, 실내 스튜디오 조명을 적용해줘."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="mb-3"
                        />
                    </div>
                    {/* 버튼 */}
                    <Button
                        variant="primary" // Bootstrap primary button
                        className="w-100 py-2"
                        onClick={handleGenerateClick}
                        disabled={isLoading}
                    >
                        {isLoading ? '생성 중...' : '이미지 생성하기'}
                    </Button>
                </Col>
                {/* 생성된 이미지 표시 컨테이너 */}
                <Col md={6}> {/* Half width on medium screens and up */}
                    <div className="d-flex align-items-center justify-content-center bg-light rounded p-4 shadow-sm position-relative" style={{ minHeight: '400px' }}>
                        {isLoading && (
                            <div className="text-center text-primary">
                                {/* Bootstrap spinner example */}
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2">이미지 생성 중...</p>
                            </div>
                        )}
                        {!isLoading && (
                            <Image
                                src={resultImageUrl}
                                alt="Generated Image"
                                className="img-fluid rounded shadow-lg" // Bootstrap responsive image class
                            />
                        )}
                        {message.text && (
                            <div className={`alert ${getMessageAlertClass(message.color)} position-absolute top-50 start-50 translate-middle text-center`} role="alert">
                                {message.text}
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

// Bootstrap alert class mapping
const getMessageAlertClass = (colorClass) => {
    switch (colorClass) {
        case 'text-red-500':
        case 'text-danger':
            return 'alert-danger';
        case 'text-green-500':
        case 'text-success':
            return 'alert-success';
        case 'text-yellow-500':
        case 'text-warning':
            return 'alert-warning';
        default:
            return 'alert-info'; // Default to info if no specific class
    }
};

export default Gemini;