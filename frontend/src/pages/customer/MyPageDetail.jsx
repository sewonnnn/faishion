import {useAuth} from "../../contexts/AuthContext.jsx";
import {useEffect, useState} from "react";
import {Container, Card, Form, Button, Row, Col, Image as BootstrapImage} from 'react-bootstrap';
import {FaUser, FaLock, FaEnvelope, FaPhone, FaCamera} from 'react-icons/fa';
import PostcodeSearch from "./PostcodeSearch.jsx";

const MyPageDetail = () => {
    const {api} = useAuth();
    const [customer, setCustomer] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        email: '',
        name: '',
        phoneNumber: '',
        password: '',
        zipcode: '',
        street: '',
        detail: '',
    });
    // 여기에 상태 선언 추가
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

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
                    zipcode: userData.zipcode,
                    street: userData.street,
                    detail: userData.detail,
                });

                if (userData.image && userData.image.id) {
                    setImagePreviewUrl(`${api.defaults.baseURL}/image/${userData.image.id}`);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
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
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let updatedUserData = {...formData};

            // 이미지 파일이 선택되지 않았을 경우, 기존 이미지 정보를 그대로 사용
            if (!selectedImage && customer && customer.image) {
                updatedUserData = { ...updatedUserData, image: { id: customer.image.id } };
            } else if (selectedImage) {
                // 새 이미지 파일이 선택된 경우, 업로드 로직 실행
                const imageFormData = new FormData();
                imageFormData.append('file', selectedImage);
                const imageUploadResponse = await api.post('/image', imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                updatedUserData = { ...updatedUserData, image: { id: imageUploadResponse.data.id } };
            } else {
                // 이미지가 없거나 삭제된 경우
                updatedUserData = { ...updatedUserData, image: null };
            }

            updatedUserData.zipcode = formData.zipcode;
            updatedUserData.street = formData.street;
            updatedUserData.detail = formData.detail;

            await api.put(`/user/${updatedUserData.id}`, updatedUserData);
            alert("회원 정보가 성공적으로 수정되었습니다.");

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
                                {/* 프로필 사진 */}
                                <div className="text-center mb-3">
                                    <div className="profile-image-container mb-2">
                                        <BootstrapImage
                                            src={imagePreviewUrl || "https://via.placeholder.com/150"}
                                            roundedCircle
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <Form.Group controlId="formFile" className="mb-3">
                                        <Form.Label><FaCamera/> 프로필 사진 변경</Form.Label>
                                        <Form.Control type="file" onChange={handleImageChange} accept="image/*" />
                                    </Form.Group>
                                </div>
                                <Form.Group className="mb-3">
                                    <Form.Label>아이디</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaUser /></div>
                                        <Form.Control type="text" name="id" value={formData.id} disabled />
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>비밀번호</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaLock /></div>
                                        <Form.Control type="password" name="password" value={formData.password} onChange={handleInputChange} />
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>이름</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaUser /></div>
                                        <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>휴대폰 번호</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaPhone /></div>
                                        <Form.Control type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>이메일</Form.Label>
                                    <div className="input-group">
                                        <div className="input-group-text"><FaEnvelope /></div>
                                        <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                    </div>
                                </Form.Group>
                                <PostcodeSearch
                                    onAddressSelect={handleAddressSelect}
                                    postcode={formData.zipcode}
                                    baseAddress={formData.street}
                                />
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