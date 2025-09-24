// src/components/seller/productform/MultipleImageUploader.jsx
import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';

const MultipleImageUploader = ({ images, onAddImage, onRemoveImage, onUpdateImage, label }) => {
    return (
        <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">{label} :</Form.Label>
            <Col sm="10">
                <div style={{
                    border: '1px dashed #ccc',
                    padding: '10px',
                    display: 'flex',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    gap: '10px'
                }}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
                            // 이미지 클릭 시 숨겨진 input을 클릭하도록 연결
                            onClick={() => document.getElementById(`image-edit-input-${label}-${index}`).click()}
                        >
                            <img
                                src={URL.createObjectURL(image)}
                                alt={`${label} ${index + 1}`}
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            {/* 삭제 버튼 */}
                            <Button
                                variant="danger"
                                size="sm"
                                // 이벤트 버블링 방지를 위해 e.stopPropagation() 추가
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveImage(index);
                                }}
                                style={{ position: 'absolute', top: '5px', right: '5px' }}
                            >
                                &times;
                            </Button>
                            {/* 숨겨진 파일 입력 필드: 이미지 수정을 위해 사용됩니다. */}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files.length > 0) {
                                        onUpdateImage(index, e.target.files[0]);
                                    }
                                }}
                                id={`image-edit-input-${label}-${index}`}
                                style={{ display: 'none' }}
                            />
                        </div>
                    ))}
                    {/* 이미지 추가 버튼 */}
                    <div style={{
                        flexShrink: 0,
                        width: '150px',
                        height: '150px',
                        border: '2px dashed #ccc',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                    }}>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={onAddImage}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ fontSize: '3rem', color: '#ccc' }}>+</span>
                    </div>
                </div>
            </Col>
        </Form.Group>
    );
};

export default MultipleImageUploader;