import {useAuth} from "../../contexts/AuthContext.jsx";
import {useEffect, useState, useRef} from "react";
import { useNavigate } from "react-router-dom";
import {Container, Card, Form, Button, Row, Col, Modal, Image as BootstrapImage} from 'react-bootstrap';
import {
    FaUser, FaLock, FaEnvelope, FaPhone, FaCamera, FaTimesCircle, FaRulerVertical, FaWeight, FaEye, FaEyeSlash,
    FaMapMarkerAlt, FaExpand
} from 'react-icons/fa';
import defaultImage from "../../assets/user.jpg";
import "../../pages/MyPage.css";
import AddressModal from "./AddressModal.jsx";
import UserImageModal from "./UserImageModal.jsx";


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
    });
    const [defaultAddress, setDefaultAddress] = useState(null); // 기본배송지 정보 상태
    const [showAddressModal, setShowAddressModal] = useState(false); // 모달 관리
    const [passwordConfirm, setPasswordConfirm] = useState(''); // 비밀번호 작성창
    const [passwordError, setPasswordError] = useState(''); // 패스워드 에러메시지
    const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false); // 비밀번호 저장모드 전환
    const [isPasswordSaved, setIsPasswordSaved] = useState(false); // 비밀번호 저장가능 여부 (정규화)
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 가시화
    const [imagePreviewUrl, setImagePreviewUrl] = useState(''); // 이미지 url


    const [showUserImageModal, setShowUserImageModal] = useState(false);
    const [showImageEnlargedModal, setShowImageEnlargedModal] = useState(false); // 확대된 이미지 모달 관리


    const nav = useNavigate();
    const fetchUserData = async () => {
        try {
            const response = await api.get(`/user/`);
            const userData = response.data;
            setCustomer(userData); // 유저정보
            setDefaultAddress(userData.address); // 주소정보

            setFormData({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                phoneNumber: userData.phoneNumber,
                password: '',
                height: userData.height || '',
                weight: userData.weight || '',
            });
            setPasswordConfirm('');
            setPasswordError('');
            setIsPasswordChangeMode(false);
            setIsPasswordSaved(false);

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
    useEffect(() => {
        fetchUserData();
    }, [api]);
    // 주소관리
    const handleAddressUpdated = (newDefaultAddress) => {
        setDefaultAddress(newDefaultAddress);
        // fetchUserData();
    };
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

    const handleUserImageUpdated = ({ generatedImageId, height, weight }) => {
        // 1. formData (키, 몸무게) 업데이트
        setFormData(prev => ({
            ...prev,
            height: height || '',
            weight: weight || ''
        }));
        // 2. customer 상태 업데이트 (업데이트된 이미지를 반영하기 위함)
        setCustomer(prev => ({
            ...prev,
            height: height || null,
            weight: weight || null,
            image: generatedImageId ? { id: generatedImageId } : null,
        }));
        // 3. 이미지 미리보기 URL 업데이트
        if (generatedImageId) {
            setImagePreviewUrl(`${api.defaults.baseURL}/image/${generatedImageId}`);
        } else {
            setImagePreviewUrl(defaultImage);
        }
        // 4. 모달 닫기
        setShowUserImageModal(false);
    }

    const handleDeleteImage = (e) => {
        if (e) e.stopPropagation();

        setImagePreviewUrl(defaultImage);
        setCustomer(prev => ({
            ...prev,
            image: null
        }));
    };

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

            if (customer && customer.image) {
                updatedUserData = { ...updatedUserData, image: { id: customer.image.id } };
            }else{
                updatedUserData = { ...updatedUserData, image: null };
            }

            await api.put(`/user/${updatedUserData.id}`, updatedUserData);
            alert("회원 정보가 성공적으로 수정되었습니다.");

            const response = await api.get(`/user/`);
            setCustomer(response.data);
            if (response.data.image && response.data.image.id) {
                setImagePreviewUrl(`${api.defaults.baseURL}/image/${response.data.image.id}`);
            } else {
                setImagePreviewUrl(defaultImage);
            }
            // 수정 완료 후 상태 초기화
            setPasswordConfirm('');
            setFormData(prev => ({ ...prev, password: '' }));
            setIsPasswordChangeMode(false);
            setIsPasswordSaved(false);
            nav("/mypage");
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
                    <Card className="border-0">
                        <Card.Body className="p-4 bg-white" >
                            <h4 className="text-center mb-4">회원 정보 수정</h4>
                            <Form onSubmit={handleSubmit}>
                                {/* 프로필 사진 섹션 */}
                                <div className="text-center mb-3">
                                    <div className="profile-image-wrapper mb-3"
                                        onClick={() => setShowUserImageModal(true)} // <-- 1. 이미지 클릭 이벤트 추가
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <BootstrapImage
                                            src={imagePreviewUrl || defaultImage}
                                            roundedCircle
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                        {imagePreviewUrl !== defaultImage && (
                                            <>
                                            <Button
                                                variant="link"
                                                className="image-delete-btn"
                                                onClick={handleDeleteImage}
                                            >
                                                <FaTimesCircle size={24} color="#444" />
                                            </Button>
                                            <Button
                                                variant="dark"
                                                className="image-enlarge-btn" // CSS 스타일링을 위한 클래스
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 부모 (이미지 클릭) 이벤트 방지
                                                    setShowImageEnlargedModal(true); // 기존 UserImageModal 열기
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '5px',
                                                    left: 'calc(50% - 75px + 5px)', // 이미지 중앙에서 왼쪽으로 75px (반지름) + 5px (패딩)
                                                    transform: 'translateX(0)',
                                                    borderRadius: '50%',
                                                    padding: '5px',
                                                    height: '35px',
                                                    width: '35px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 10,
                                                }}
                                            >
                                                <FaExpand size={16} />
                                            </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

{/*                                  */}{/* 아이디 */}
{/*                                 <Form.Group className="mb-3"> */}
{/*                                     <Form.Label>아이디</Form.Label> */}
{/*                                     <div className="input-group"> */}
{/*                                         <div className="input-group-text"><FaUser /></div> */}
{/*                                         <Form.Control type="text" name="id" value={formData.id} disabled /> */}
{/*                                     </div> */}
{/*                                 </Form.Group> */}

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
                                                <Form.Control.Feedback type="!invalid" className="text-danger">
                                                    {passwordError}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Button
                                                    variant="primary"
                                                    className="w-50"
                                                    onClick={handlePasswordSave}
                                                >
                                                    비밀번호 저장
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="w-50"
                                                    onClick={()=>setIsPasswordChangeMode(false)}
                                                >
                                                    비밀번호 변경취소
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

                                <Form.Group className="mb-4">
                                    <Form.Label>기본 배송지</Form.Label>
                                    <Card className="p-3 bg-light border-secondary">
                                        {defaultAddress ? (
                                            <>
                                                <p className="mb-1 ">
                                                    [{defaultAddress.zipcode}] {defaultAddress.street}
                                                </p>
                                                <p className="text-muted small mb-0">
                                                    {defaultAddress.detail}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-muted mb-0">설정된 기본 배송지가 없습니다.</p>
                                        )}
                                    </Card>
                                    <Button
                                        variant="outline-secondary"
                                        className="mt-2 w-100"
                                        onClick={() => setShowAddressModal(true)}
                                    >
                                        <FaMapMarkerAlt className="me-1"/> 배송지 관리 / 기본 배송지 변경
                                    </Button>
                                </Form.Group>
                                <div className="d-grid gap-2">
                                    <Button style={{backgroundColor:'#1850DB'}} type="submit" size="lg">
                                        수정 완료
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <AddressModal
                show={showAddressModal}
                handleClose={() => setShowAddressModal(false)}
                handleAddressUpdated={handleAddressUpdated} // 기본 주소 변경 시 부모 컴포넌트 업데이트 콜백
            />
            <UserImageModal
                show={showUserImageModal}
                handleClose={() => setShowUserImageModal(false)}
                handleUserImageUpdated={handleUserImageUpdated}
                api={api}
                currentHeight={formData.height}
                currentWeight={formData.weight}
            />
            {/* 새로 추가된 이미지 확대 모달 */}
            <Modal show={showImageEnlargedModal} onHide={() => setShowImageEnlargedModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0">
                </Modal.Header>
                <Modal.Body className="text-center p-0">
                    <BootstrapImage
                        src={imagePreviewUrl || defaultImage}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '80vh', // 뷰포트 높이의 80%를 초과하지 않도록 설정
                            objectFit: 'contain'
                        }}
                    />
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default MyPageDetail;
