// src/components/seller/productform/MultipleStockImageUploader.jsx
import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';

const MultipleStockImageUploader = ({ stocks, onAddStockImage, onRemoveStockImage, onUpdateStockItem, label }) => {
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
                    {stocks.map((stock, index) => (
                        <div key={index} style={{
                            position: 'relative',
                            display: 'inline-block',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            padding: '5px',
                            textAlign: 'center'
                        }}>
                            <img
                                src={URL.createObjectURL(stock.image)}
                                alt={`${label} ${index + 1}`}
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <div className="mt-2">
                                <Form.Control
                                    type="text"
                                    placeholder="색상"
                                    value={stock.color}
                                    onChange={(e) => onUpdateStockItem(index, 'color', e.target.value)}
                                    style={{ width: '100px', margin: '5px auto' }}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="사이즈"
                                    value={stock.size}
                                    onChange={(e) => onUpdateStockItem(index, 'size', e.target.value)}
                                    style={{ width: '100px', margin: '5px auto' }}
                                />
                                <Form.Control
                                    type="number"
                                    placeholder="수량"
                                    value={stock.count}
                                    onChange={(e) => onUpdateStockItem(index, 'count', parseInt(e.target.value) || 0)}
                                    min="0"
                                    style={{ width: '100px', margin: '5px auto' }}
                                />
                            </div>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onRemoveStockImage(index)}
                                style={{ position: 'absolute', top: '5px', right: '5px' }}
                            >
                                &times;
                            </Button>
                        </div>
                    ))}
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
                            onChange={onAddStockImage}
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

export default MultipleStockImageUploader;