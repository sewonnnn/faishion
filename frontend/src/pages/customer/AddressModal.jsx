// AddressManagerModal.jsx

import React, {useState, useEffect} from 'react';
import {Modal, Button, ListGroup, Form, Row, Col, Card} from 'react-bootstrap';
import {FaMapMarkerAlt, FaPlus, FaPencilAlt, FaTrashAlt, FaCheckCircle} from 'react-icons/fa';
import {useAuth} from "../../contexts/AuthContext.jsx";
import PostcodeSearch from "./PostcodeSearch.jsx";

// Address DTO (서버 응답 형태)
const initialAddressData = {
    id: null,
    zipcode: '',
    street: '',
    detail: '',
    isDefault: false,
    requestMsg: '',
};

const AddressModal = ({show, handleClose, handleAddressUpdated, handleAddressSelectForUse = null}) => {
    const {api} = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [newAddressForm, setNewAddressForm] = useState(initialAddressData);

    const fetchAddresses = async () => {
        try {
            // ✅ GET /address/list 적용 완료 (이전 단계에서 이미 수정됨)
            const response = await api.get('/address/list');
            setAddresses(response.data);
        } catch (error) {
            console.error('배송지 목록을 불러오는 데 실패했습니다:', error);
            setAddresses([]);
        }
    };

    useEffect(() => {
        if (show) {
            fetchAddresses();
        }
    }, [show]);
    const handleAddressInputChange = (e) => {
        const {name, value} = e.target;
        const currentForm = editingAddress || newAddressForm;
        const setter = editingAddress ? setEditingAddress : setNewAddressForm;

        setter({...currentForm, [name]: value});
    };

    const handleAddressSelect = (addressData) => {
        const currentForm = editingAddress || newAddressForm;
        const setter = editingAddress ? setEditingAddress : setNewAddressForm;

        setter(prev => ({
            ...prev,
            zipcode: addressData.zipcode,
            street: addressData.street,
        }));
    };

    // 추가/수정 저장
    const handleSaveAddress = async (e) => {
        e.preventDefault();

        // isDefault 필드는 서버에서만 관리하므로, POST/PUT 요청 시 제외합니다.
        const { isDefault, ...dataToSend } = editingAddress || newAddressForm;

        try {
            if (dataToSend.id) {
                await api.put(`/address/${dataToSend.id}`, dataToSend);
                alert("배송지 정보가 수정되었습니다.");
            } else {
                await api.post('/address', dataToSend);
                alert("새 배송지가 추가되었습니다.");
                setIsAdding(false);
                setNewAddressForm(initialAddressData);
            }

            await fetchAddresses(); // 목록 새로고침
            setEditingAddress(null);
        } catch (error) {
            console.error('주소 저장/수정 실패:', error);
            alert("주소 저장에 실패했습니다. 모든 필수 정보를 입력했는지 확인해주세요.");
        }
    };

    // 삭제
    const handleDeleteAddress = async (id) => {
        if (!window.confirm("정말 이 배송지를 삭제하시겠습니까?")) return;
        try {
            // ✅ 삭제: DELETE /address/{id} API 호출 적용
            await api.delete(`/address/${id}`);
            alert("배송지가 성공적으로 삭제되었습니다.");

            // 삭제 후 기본 배송지가 변경되었을 수 있으므로 부모 상태도 업데이트합니다.
            // (가장 최신 기본 주소를 다시 불러와 부모에게 전달하는 로직이 필요하지만,
            // 일단은 목록만 새로고침하고 부모 컴포넌트에서 알아서 처리하게 두는 것이 간단합니다.)
            await fetchAddresses();

            // 💡 중요: 만약 삭제된 주소가 기본 주소였다면 MyPageDetail의 defaultAddress 상태를 null로 만들어야 합니다.
            // 백엔드에서 기본 주소 삭제 시 다른 주소로 자동 변경해주지 않는다면 (현재는 에러 반환)
            // 명시적으로 `handleAddressUpdated(null);`을 호출해야 합니다.

        } catch (error) {
            const errorMessage = error.response?.status === 400
                ? "기본 배송지는 삭제할 수 없습니다. 다른 주소를 기본으로 설정 후 삭제해주세요."
                : "주소 삭제에 실패했습니다.";
            console.error('주소 삭제 실패:', error);
            alert(errorMessage);
        }
    };

    // 기본 배송지 설정
    const handleSetDefault = async (addressId) => {
        try {
            // ✅ 기본 설정: PUT /address/default/{id} API 호출 (이미 올바름)
            const response = await api.put(`/address/default/${addressId}`);

            const newDefaultAddress = response.data;

            handleAddressUpdated(newDefaultAddress); // 부모 컴포넌트에 새 기본 주소 전달

            await fetchAddresses(); // 모달 내 목록 새로고침

        } catch (error) {
            console.error('기본 배송지 설정 실패:', error);
            alert("기본 배송지 설정에 실패했습니다.");
        }
    };

    const handleSelectAddressForUse = (address) => {
        if (handleAddressSelectForUse) {
            handleAddressSelectForUse(address);
        }
    };

    // 모달 닫기 핸들러
    const handleModalClose = () => {
        setIsAdding(false);
        setEditingAddress(null);
        setNewAddressForm(initialAddressData);
        handleClose();
    };

    // 리스트 아이템에 동적 클래스 및 클릭 핸들러 적용
    const isSelectable = !!handleAddressSelectForUse && !isAdding && !editingAddress;

    return (
        <Modal show={show} onHide={handleModalClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title><FaMapMarkerAlt className="me-2" /> 배송지 관리</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                {/* 주소 추가/수정 폼 */}
                {(isAdding || editingAddress) && (
                    <Card className="mb-4 p-3 bg-light">
                        <h5 className="mb-3">{editingAddress ? '배송지 수정' : '새 배송지 추가'}</h5>
                        <Form onSubmit={handleSaveAddress}>
                            <PostcodeSearch
                                onAddressSelect={handleAddressSelect}
                                postcode={(editingAddress || newAddressForm).zipcode}
                                baseAddress={(editingAddress || newAddressForm).street}
                            />
                            <Form.Group className="mb-3">
                                <Form.Label>상세 주소</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="detail"
                                    value={(editingAddress || newAddressForm).detail}
                                    onChange={handleAddressInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>요청 사항 (선택)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="requestMsg"
                                    value={(editingAddress || newAddressForm).requestMsg || ''}
                                    onChange={handleAddressInputChange}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="me-2">저장</Button>
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingAddress(null);
                                }}
                            >
                                취소
                            </Button>
                        </Form>
                    </Card>
                )}

                {/* 주소 목록 헤더 */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">등록된 배송지 목록</h5>
                    {!isAdding && !editingAddress && (
                        <Button variant="success" onClick={() => setIsAdding(true)}>
                            <FaPlus className="me-1"/> 새 주소 추가
                        </Button>
                    )}
                </div>

                {/* 주소 목록 */}
                <ListGroup variant="flush">
                    {addresses.length === 0 ? (
                        <p className="text-center text-muted">등록된 배송지가 없습니다.</p>
                    ) : (
                        addresses.map((address) => (
                            <ListGroup.Item
                                key={address.id}
                                action={isSelectable}
                                className={`d-flex justify-content-between align-items-center ${address.isDefault ? 'border border-primary border-3' : ''}`}
                                onClick={isSelectable ? () => handleSelectAddressForUse(address) : undefined}
                            >
                                <div>
                                    <p className="mb-1 fw-bold">
                                        {address.isDefault && <FaCheckCircle className="text-primary me-2"/>}
                                        [{address.zipcode}] {address.street}
                                    </p>
                                    <p className="text-muted small mb-0 ms-4">
                                        {address.detail} | 요청: {address.requestMsg || '없음'}
                                    </p>
                                </div>
                                <div className="d-flex flex-column align-items-end">
                                    <div className="mb-1">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="me-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAddress(address);
                                            }}
                                        >
                                            <FaPencilAlt /> 수정
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAddress(address.id);
                                            }}
                                        >
                                            <FaTrashAlt /> 삭제
                                        </Button>
                                    </div>
                                    {!address.isDefault && (
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetDefault(address.id);
                                            }}
                                        >
                                            기본 배송지로 설정
                                        </Button>
                                    )}
                                </div>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleModalClose}>
                    닫기
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddressModal;