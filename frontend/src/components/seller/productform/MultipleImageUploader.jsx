// src/components/seller/productform/MultipleImageUploader.jsx
import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';

const MultipleImageUploader = ({ images, onAddImage, onRemoveImage, label }) => {
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
                        <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                            <img
                                src={URL.createObjectURL(image)}
                                alt={`${label} ${index + 1}`}
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onRemoveImage(index)}
                                style={{ position: 'absolute', top: '5px', right: '5px' }}
                            >
                                &times;
                            </Button>
                        </div>
                    ))}
                    <div style={{
                        // 추가된 부분: flex-shrink: 0
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