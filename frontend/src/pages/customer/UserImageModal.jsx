import React, {useState, useRef} from 'react';
import {Modal, Button, Form, Row, Col, Image as BootstrapImage, Spinner} from 'react-bootstrap';
import { FaRulerVertical, FaWeight, FaTimesCircle } from 'react-icons/fa';

const initialFormData = {
    height: '',
    weight: ''
};

const UserImageModal = ({show, handleClose, handleUserImageUpdated, api, currentHeight, currentWeight}) => {
    const [formData, setFormData] = useState(initialFormData);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        const updatedValue = (name === 'height' || name === 'weight') ? (value === '' ? '' : Number(value)) : value;
        setFormData(prev => ({...prev, [name]: updatedValue}));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
        }
    };

    const handleImageClick = () => {
        if (!isLoading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDeleteImage = () => {
        setSelectedFile(null);
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleModalClose = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setFormData(initialFormData);
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsLoading(false);
        handleClose();
    };

    // 최종 선택 및 모달 닫기 로직 (생성 완료 후 즉시 호출될 로직)
    const handleFinalSelectAndClose = (generatedImageId, height, weight) => {
        handleUserImageUpdated({
            generatedImageId: generatedImageId,
            height: height,
            weight: weight
        });
        handleModalClose();
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!api) {
            alert("API 연결 상태를 확인할 수 없습니다.");
            return;
        }
        if (!selectedFile) {
            alert("먼저 AI 생성에 사용할 프로필 사진을 선택해주세요.");
            return;
        }
        if (!formData.height || !formData.weight) {
            alert("키와 체중은 필수 입력 정보입니다.");
            return;
        }
        setIsLoading(true);
        let currentUploadedImageId = null;
        try {
            // 1. 원본 이미지 서버 업로드 및 ID 확보
            const imageFormData = new FormData();
            imageFormData.append('file', selectedFile);
            const uploadResponse = await api.post('/image', imageFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            currentUploadedImageId = uploadResponse.data.id;
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(`${api.defaults.baseURL}/image/${currentUploadedImageId}`);
            const generationResponse = await api.post("/image/generate",
                {
                    imageIds: [currentUploadedImageId],
                    customPrompt : `face, expression, outfit strictly maintained, Full-body shot, **straight pose, from head to toe, centered**, soft natural lighting, High quality, Ultra detailed, Photorealistic fashion editorial, professional photography, ${formData.height}cm ${formData.weight}kg body type equivalent feel, pure white background`
                }
            );
            handleFinalSelectAndClose(generationResponse.data.id, formData.height, formData.weight);
        } catch (error) {
            console.error("AI 이미지 생성 실패:", error.response ? error.response.data : error.message);
            alert("AI 이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            setSelectedFile(null);
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } finally {
            setIsLoading(false);
        }
    };
    // 이미지가 없을 때의 Placeholder 스타일
    const placeholderStyle = {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        backgroundColor: '#EEEEEE',
        border: '2px dashed #999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        objectFit: 'cover'
    };


    return (
        <Modal show={show} onHide={handleModalClose} size="md" centered backdrop="static" keyboard={!isLoading}>
            <Modal.Header closeButton={!isLoading} className="border-0">
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleGenerate} className="text-center">
                    {/* 이미지 미리보기 및 클릭 이벤트 추가 */}
                    <div
                        className="profile-image-wrapper mb-3 mx-auto"
                        style={{ position: 'relative', display: 'inline-block', cursor: isLoading ? 'default' : 'pointer' }}
                        onClick={handleImageClick}
                    >
                        {previewUrl ? (
                            <BootstrapImage
                                src={previewUrl}
                                roundedCircle
                                style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #ddd' }}
                            />
                        ) : (
                            // 이미지가 없을 때 Placeholder 표시
                            <div style={placeholderStyle}>
                                {isLoading ? '이미지 생성 대기...' : '클릭하여 이미지 선택'}
                            </div>
                        )}

                        {/* 이미지 삭제 버튼 (선택된 파일이 있고, 로딩 중이 아닐 때만 표시) */}
                        {previewUrl && !isLoading && (
                            <Button
                                variant="link"
                                className="image-delete-btn"
                                onClick={(e) => { e.stopPropagation(); handleDeleteImage(); }}
                                style={{ position: 'absolute', top: 0, right: 0 }}
                            >
                                <FaTimesCircle size={24} color="#444" style={{ backgroundColor: 'white', borderRadius: '50%' }}/>
                            </Button>
                        )}
                    </div>

                    {/* 파일 선택 input (숨김) */}
                    <Form.Control
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        ref={fileInputRef}
                        className="visually-hidden"
                        disabled={isLoading}
                    />

                    {/* 키/체중 입력 필드 */}
                    <Row className="mb-4">
                        {/* 키 */}
                        <Col sm={6}>
                            <Form.Group controlId="formHeight">
                                <Form.Label>키 (cm)</Form.Label>
                                <div className="input-group">
                                    <div className="input-group-text"><FaRulerVertical /></div>
                                    <Form.Control
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleInputChange}
                                        min="0"
                                        required
                                        placeholder="예: 175"
                                        disabled={isLoading}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        {/* 몸무게 */}
                        <Col sm={6}>
                            <Form.Group controlId="formWeight">
                                <Form.Label>몸무게 (kg)</Form.Label>
                                <div className="input-group">
                                    <div className="input-group-text"><FaWeight /></div>
                                    <Form.Control
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.1"
                                        required
                                        placeholder="예: 70.5"
                                        disabled={isLoading}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* AI 이미지 생성 요청 버튼 */}
                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100 mb-3 rounded-2"
                        style={{ backgroundColor : "#1850DB", borderColor: "#1850DB"}}
                        disabled={isLoading || !selectedFile || !formData.height || !formData.weight}
                    >
                        {isLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                이미지 생성 중...
                            </>
                        ) : (
                            <>
                                AI 이미지 생성
                            </>
                        )}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default UserImageModal;