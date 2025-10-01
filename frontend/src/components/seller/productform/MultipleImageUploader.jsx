// src/components/seller/productform/MultipleImageUploader.jsx (수정)
import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';

// onUpdateImage -> onReplaceImage로 이름 변경 (기존 이미지/파일을 새 파일로 대체)
const MultipleImageUploader = ({ images, onAddImage, onRemoveImage, onReplaceImage, label }) => {
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
                    {images.map((imageObj, index) => {
                        // 이미지 소스 결정: File 객체인 경우 URL.createObjectURL 사용, 아니면 url 사용
                        const src = imageObj.file ? URL.createObjectURL(imageObj.file) :
                                    (imageObj.url ? imageObj.url : '');

                        return (
                            <div
                                key={index}
                                style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
                                // 클릭 시 파일 교체 input 활성화
                                onClick={() => document.getElementById(`image-replace-input-${label}-${index}`).click()}
                            >
                                <img
                                    src={src}
                                    alt={`${label} ${index + 1}`}
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                                {/* 삭제 버튼 */}
                                <Button
                                    variant="danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveImage(index);
                                    }}
                                    style={{ position: 'absolute', top: '5px', right: '8px', height:'28px', paddingBottom:'30px'}}
                                >
                                    &times;
                                </Button>
                                {/* 숨겨진 파일 입력 필드: 이미지 교체를 위해 사용 */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files.length > 0) {
                                            // onReplaceImage 호출
                                            onReplaceImage(index, e.target.files[0]);
                                        }
                                        e.target.value = null;
                                    }}
                                    id={`image-replace-input-${label}-${index}`}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        );
                    })}
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
                                top: 0, left: 0, width: '100%', height: '100%',
                                opacity: 0, cursor: 'pointer'
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