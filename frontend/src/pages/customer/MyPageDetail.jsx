import {useAuth} from "../../contexts/AuthContext.jsx";
import {useEffect, useState, useRef} from "react";
import {Container, Card, Form, Button, Row, Col, Image as BootstrapImage} from 'react-bootstrap';
import {FaUser, FaLock, FaEnvelope, FaPhone, FaCamera, FaTimesCircle, FaRulerVertical, FaWeight, FaEye, FaEyeSlash} from 'react-icons/fa';
import PostcodeSearch from "./PostcodeSearch.jsx";
import defaultImage from "../../assets/user.jpg";
import "../../pages/MyPage.css";

const MyPageDetail = () => {
    const {api} = useAuth();
    const [customer, setCustomer] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        email: '',
        name: '',
        phoneNumber: '',
        password: '',
        height: '',
        weight: '',
        zipcode: '',
        street: '',
        detail: '',
    });
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false);
    // ⭐ 추가: 비밀번호 저장 완료 상태
    const [isPasswordSaved, setIsPasswordSaved] = useState(false);
    // ⭐ 추가: 비밀번호 가시성 상태
    const [showPassword, setShowPassword] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get(`/user/`);
                const userData = response.data;
                setCustomer(userData);

                setFormData({
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    phoneNumber: userData.phoneNumber,
                    password: '',
                    height: userData.height || '',
                    weight: userData.weight || '',
                    zipcode: userData.zipcode,
                    street: userData.street,
                    detail: userData.detail,
                });
                setPasswordConfirm('');
                setPasswordError('');
                setIsPasswordChangeMode(false);
                setIsPasswordSaved(false); // 상태 초기화

                if (userData.image && userData.image.id) {
                    setImagePreviewUrl(`${api.defaults.baseURL}/image/${userData.image.id}`);
                } else {
                    setImagePreviewUrl(defaultImage);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
                setImagePreviewUrl(defaultImage);
            }
        };
        fetchUserData();
    }, [api]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;

        if (name === 'password' || name === 'passwordConfirm') {
            setPasswordError('');
        }

        const updatedValue = (name === 'height' || name === 'weight') ? (value === '' ? '' : Number(value)) : value;

        if (name === 'passwordConfirm') {
            setPasswordConfirm(value);
        } else {
            setFormData({...formData, [name]: updatedValue});
        }
    };

    const handleAddressSelect = (addressData) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            zipcode: addressData.zipcode,
            street: addressData.street,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedImage(null);
            if (customer?.image) {
                setImagePreviewUrl(`${api.defaults.baseURL}/image/${customer.image.id}`);
            } else {
                setImagePreviewUrl(defaultImage);
            }
        }
    };

    const handleDeleteImage = () => {
        setSelectedImage(null);
        setImagePreviewUrl(defaultImage);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ⭐ 추가: 비밀번호 저장 버튼 핸들러
    const handlePasswordSave = () => {
        // 정규화: 문자, 숫자, 특수문자(@$!%*#?&) 포함 8자 이상
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

        if (formData.password !== passwordConfirm) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
            setIsPasswordSaved(false);
            return;
        }

        if (!passwordRegex.test(formData.password)) {
            setPasswordError("비밀번호는 8자 이상, 문자, 숫자, 특수문자를 포함해야 합니다.");
            setIsPasswordSaved(false);
            return;
        }

        // 유효성 검사 통과 시
        setPasswordError("");
        setIsPasswordSaved(true);
    };

    // ⭐ 추가: 비밀번호 재설정 버튼 핸들러
    const handlePasswordReset = () => {
      setIsPasswordSaved(false);
      setFormData(prev => ({ ...prev, password: '' }));
      setPasswordConfirm('');
      setPasswordError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        // 비밀번호 변경 모드인데 저장되지 않았을 경우 제출 방지
        if (isPasswordChangeMode && !isPasswordSaved) {
            alert("비밀번호를 먼저 저장해주세요.");
            return;
        }

        try {
            let updatedUserData = {...formData};

            if (!isPasswordChangeMode || (isPasswordChangeMode && !isPasswordSaved)) {
                // 비밀번호 변경 모드가 아니거나 저장되지 않았으면 비밀번호를 전송하지 않음
                delete updatedUserData.password;
            }

            // 이미지 처리 로직
            if (selectedImage) {
                const imageFormData = new FormData();
                imageFormData.append('file', selectedImage);
                const imageUploadResponse = await api.post('/image', imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                updatedUserData = { ...updatedUserData, image: { id: imageUploadResponse.data.id } };
            } else if (imagePreviewUrl === defaultImage && (customer?.image || selectedImage === null)) {
                updatedUserData = { ...updatedUserData, image: null };
            } else if (customer && customer.image) {
                updatedUserData = { ...updatedUserData, image: { id: customer.image.id } };
            } else {
                updatedUserData = { ...updatedUserData, image: null };
            }

            updatedUserData.zipcode = formData.zipcode;
            updatedUserData.street = formData.street;
            updatedUserData.detail = formData.detail;

            await api.put(`/user/${updatedUserData.id}`, updatedUserData);
            alert("회원 정보가 성공적으로 수정되었습니다.");

            const response = await api.get(`/user/`);
            setCustomer(response.data);
            if (response.data.image && response.data.image.id) {
                setImagePreviewUrl(`${api.defaults.baseURL}/image/${response.data.image.id}`);
            } else {
                setImagePreviewUrl(defaultImage);
            }
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            // 수정 완료 후 상태 초기화
            setPasswordConfirm('');
            setFormData(prev => ({ ...prev, password: '' }));
            setIsPasswordChangeMode(false);
            setIsPasswordSaved(false);

        } catch (error) {
            console.error("회원 정보 수정 실패:", error.response ? error.response.data : error.message);
            alert("회원 정보 수정에 실패했습니다.");
        }
    };

    if (!customer) {
        return <div className="text-center mt-5">로딩 중...</div>;
    }


    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card>
                        <Card.Body className="p-4">
                            <h4 className="text-center mb-4">회원 정보 수정</h4>
                            <Form onSubmit={handleSubmit}>
                                {/* 프로필 사진 섹션 */}
                                <div className="text-center mb-3">
                                    <div className="profile-image-wrapper mb-3">
                                        <BootstrapImage
                                            src={imagePreviewUrl || defaultImage}
                                            roundedCircle
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                        {imagePreviewUrl !== defaultImage && (
                                            <Button
                                                variant="link"
                                                className="image-delete-btn"
                                                onClick={handleDeleteImage}
                                            >
                                                <FaTimesCircle size={24} color="#444" />
                                            </Button>
                                        )}
                                    </div>
                                    <Form.Group controlId="formFile" className="mb-2">
                                        <Form.Label className="btn btn-outline-secondary">
                                            <FaCamera className="me-1"/> 프로필 사진 변경
                                        </Form.Label>
                                        <Form.Control
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            ref={fileInputRef}
                                            className="visually-hidden"
                                        />
                                    </Form.Group>
                                </div>

                                {/* 아이디 */}
                                <Form.Group className="mb-3">
                                    <Form.Label>아이디</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaUser /></div>
                                        <Form.Control type="text" name="id" value={formData.id} disabled />
                                    </div>
                                </Form.Group>

                                {/* 비밀번호 입력 섹션 */}
                                {isPasswordChangeMode ? (
                                    isPasswordSaved ? (
                                        <>
                                            <Form.Group className="mb-3">
                                                <div className="alert alert-success p-2 text-center" role="alert">
                                                    비밀번호가 안전하게 저장되었습니다.
                                                </div>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Button
                                                    variant="outline-secondary"
                                                    className="w-100"
                                                    onClick={handlePasswordReset}
                                                >
                                                    비밀번호 재설정
                                                </Button>
                                            </Form.Group>
                                        </>
                                    ) : (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>비밀번호 (*)</Form.Label>
                                                <div className="input-group">
                                                    <div className="input-group-text"><FaLock /></div>
                                                    <Form.Control
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </Button>
                                                </div>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>비밀번호 확인 (*)</Form.Label>
                                                <div className="input-group">
                                                    <div className="input-group-text"><FaLock /></div>
                                                    <Form.Control
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="passwordConfirm"
                                                        value={passwordConfirm}
                                                        onChange={handleInputChange}
                                                        isInvalid={!!passwordError}
                                                        required
                                                    />
                                                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </Button>
                                                </div>
                                                <Form.Control.Feedback type="!invalid">
                                                    {passwordError}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Button
                                                    variant="primary"
                                                    className="w-100"
                                                    onClick={handlePasswordSave}
                                                >
                                                    비밀번호 저장
                                                </Button>
                                            </Form.Group>
                                        </>
                                    )
                                ) : (
                                    <Form.Group className="mb-3">
                                        <Form.Label>비밀번호</Form.Label>
                                        <Button
                                            variant="outline-secondary"
                                            className="w-100"
                                            onClick={() => setIsPasswordChangeMode(true)}
                                        >
                                            비밀번호 변경
                                        </Button>
                                    </Form.Group>
                                )}

                                {/* 이름 */}
                                <Form.Group className="mb-3">
                                    <Form.Label>이름</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaUser /></div>
                                        <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
                                    </div>
                                </Form.Group>
                                {/* 휴대폰 번호 */}
                                <Form.Group className="mb-3">
                                    <Form.Label>휴대폰 번호</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaPhone /></div>
                                        <Form.Control type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                                    </div>
                                </Form.Group>
                                {/* 이메일 */}
                                <Form.Group className="mb-3">
                                    <Form.Label>이메일</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaEnvelope /></div>
                                        <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                    </div>
                                </Form.Group>

                                <Row className="mb-3">
                                    {/* 키 (왼쪽 절반) */}
                                    <Col md={6}>
                                        <Form.Group controlId="formHeight">
                                            <Form.Label>키 (cm)</Form.Label>
                                            <div className="input-group">
                                                <div className="input-group-text"><FaRulerVertical /></div>
                                                <Form.Control
                                                    type="number"
                                                    name="height"
                                                    value={formData.height}
                                                    onChange={handleInputChange}
                                                    placeholder="예: 175"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    {/* 몸무게 (오른쪽 절반 - 필수 입력) */}
                                    <Col md={6}>
                                        <Form.Group controlId="formWeight">
                                            <Form.Label>몸무게 (kg) (*)</Form.Label>
                                            <div className="input-group">
                                                <div className="input-group-text"><FaWeight /></div>
                                                <Form.Control
                                                    type="number"
                                                    name="weight"
                                                    value={formData.weight}
                                                    onChange={handleInputChange}
                                                    placeholder="예: 70.5"
                                                    min="0"
                                                    step="0.1"
                                                    required
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* 주소 검색 */}
                                <PostcodeSearch
                                    onAddressSelect={handleAddressSelect}
                                    postcode={formData.zipcode}
                                    baseAddress={formData.street}
                                />
                                {/* 상세 주소 */}
                                <Form.Group className="mb-3">
                                    <Form.Label>상세 주소</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="detail"
                                        value={formData.detail}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit" size="lg">
                                        수정 완료
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default MyPageDetail;
