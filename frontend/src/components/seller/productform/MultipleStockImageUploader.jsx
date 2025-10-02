// src/components/seller/productform/MultipleStockImageUploader.jsx (수정)
import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';

// onUpdateStockImage -> onReplaceStockImage로 이름 변경
const MultipleStockImageUploader = ({ stocks, onAddStockImage, onRemoveStockImage, onUpdateStockItem, onReplaceStockImage, label }) => {
    return (
        <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">{label} :</Form.Label>
            <Col sm="10">
                <div style={{
                    border: '1px dashed #ccc', padding: '10px', display: 'flex',
                    overflowX: 'auto', whiteSpace: 'nowrap', gap: '10px'
                }}>
                    {stocks.map((stock, index) => {
                        // 재고 이미지 객체
                        const imageObj = stock.image;
                        // 이미지 소스 결정
                        const src = imageObj.file ? URL.createObjectURL(imageObj.file) :
                                    (imageObj.url ? imageObj.url : '');

                        return (
                            <div key={index} style={{
                                position: 'relative', display: 'inline-block', border: '1px solid #ddd',
                                 padding: '5px', textAlign: 'center', cursor: 'pointer'
                            }}>
                                {/* 이미지 영역: 클릭 시 파일 교체 input 활성화 */}
                                <div
                                    onClick={() => document.getElementById(`stock-image-replace-input-${label}-${index}`).click()}
                                    style={{
                                        display: 'inline-block', borderRadius: '5px',
                                        padding: '5px', textAlign: 'center'
                                    }}
                                >
                                    <img
                                        src={src}
                                        alt={`${label} ${index + 1}`}
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                </div>

                                {/* 재고 정보 입력 필드 */}
                                <div className="mt-2">
                                    <Form.Control
                                        type="text" placeholder="색상" value={stock.color}
                                        onChange={(e) => onUpdateStockItem(index, 'color', e.target.value)}
                                        style={{ width: '100px', margin: '5px auto' }}
                                    />
                                    <Form.Control
                                        type="text" placeholder="사이즈" value={stock.size}
                                        onChange={(e) => onUpdateStockItem(index, 'size', e.target.value)}
                                        style={{ width: '100px', margin: '5px auto' }}
                                    />
                                    {/* count 대신 quantity 사용 */}
                                    <Form.Control
                                        type="number" placeholder="수량" value={stock.quantity}
                                        onChange={(e) => onUpdateStockItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                        min="0" style={{ width: '100px', margin: '5px auto' }}
                                    />
                                </div>

                                {/* 삭제 버튼 */}
                                <Button
                                    variant="danger"
                                    onClick={() => onRemoveStockImage(index)}
                                    style={{ position: 'absolute',
                                        top: '15px', right: '17px',
                                        height:'28px', paddingBottom:'30px'}}
                                >
                                    &times;
                                </Button>

                                {/* 숨겨진 파일 입력 필드: 이미지 수정을 위해 사용 */}
                                <input
                                    type="file" accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files.length > 0) {
                                            // onReplaceStockImage 함수를 호출하여 이미지 파일을 업데이트합니다.
                                            onReplaceStockImage(index, e.target.files[0]);
                                        }
                                        e.target.value = null;
                                    }}
                                    id={`stock-image-replace-input-${label}-${index}`}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        );
                    })}
                    {/* 이미지 추가 버튼 (기존과 동일) */}
                    <div style={{
                        flexShrink: 0, width: '150px', height: '150px', border: '2px dashed #ccc',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        cursor: 'pointer', position: 'relative',
                    }}>
                        <input
                            type="file" multiple accept="image/*" onChange={onAddStockImage}
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%',
                                height: '100%', opacity: 0, cursor: 'pointer'
                            }}
                        />
                        <span style={{ fontSize: '3rem', color: '#ccc' }}>+</span>
                    </div>
                </div>
            </Col>
        </Form.Group>
    );
};

export default MultipleStockImageUploader;