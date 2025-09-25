import {useAuth} from "../../contexts/AuthContext.jsx";
import {useEffect, useState, useRef} from "react";
import {Container, Card, Form, Button, Row, Col, Image as BootstrapImage} from 'react-bootstrap';
import {FaUser, FaLock, FaEnvelope, FaPhone, FaCamera, FaTimesCircle, FaRulerVertical, FaWeight} from 'react-icons/fa';
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
    // ⭐ 비밀번호 확인 상태 추가
    const [passwordConfirm, setPasswordConfirm] = useState('');
    // ⭐ 비밀번호 오류 메시지 상태 추가
    const [passwordError, setPasswordError] = useState('');

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
                // 기존 비밀번호 정보가 없으므로 비밀번호 확인도 빈 문자열로 설정
                setPasswordConfirm('');
                setPasswordError('');


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

        // 비밀번호 입력 시 오류 메시지 초기화
        if (name === 'password' || name === 'passwordConfirm') {
            setPasswordError('');
        }

        const updatedValue = (name === 'height' || name === 'weight') ? (value === '' ? '' : Number(value)) : value;

        // ⭐ 비밀번호 확인 필드는 별도의 상태로 관리
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


    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError(''); // 제출 시도 시 오류 메시지 초기화

        if (formData.password !== passwordConfirm) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            let updatedUserData = {...formData};

            // 이미지 처리 로직 (생략 없음)
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

            // 수정 후 사용자 데이터를 다시 불러와 최신 상태로 반영
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
            setPasswordConfirm(''); // 비밀번호 확인 초기화


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

                                {/* 비밀번호 (필수 입력) */}
                                <Form.Group className="mb-3">
                                    <Form.Label>비밀번호 (*)</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaLock /></div>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </Form.Group>

                                {/* ⭐ 비밀번호 확인 (필수 입력) */}
                                <Form.Group className="mb-3">
                                    <Form.Label>비밀번호 확인 (*)</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaLock /></div>
                                        <Form.Control
                                            type="password"
                                            name="passwordConfirm"
                                            value={passwordConfirm}
                                            onChange={handleInputChange}
                                            isInvalid={!!passwordError} // 오류 메시지가 있으면 빨간색 테두리
                                        />
                                    </div>
                                </Form.Group>

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