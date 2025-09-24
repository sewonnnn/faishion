import React from 'react';
import { Button, Row, Col, Form, Image } from 'react-bootstrap';
import { FaTimes, FaCamera } from 'react-icons/fa';

const MultipleStockImageEditor = ({ stocks, onAddStockImage, onRemoveStockImage, onUpdateStockItem, onEditStockImage, label }) => {

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            onEditStockImage(index, file);
        }
    };

    return (
        <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">{label} :</Form.Label>
            <Col sm="10">
                <div className="d-flex flex-wrap gap-2">
                    {stocks.map((stock, index) => (
                        <div key={index} className="position-relative" style={{
                            width: '150px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            padding: '5px',
                            textAlign: 'center'
                        }}>
                            <Image
                                src={typeof stock.image === 'string' ? `http://localhost:8080/image/${stock.image}` : URL.createObjectURL(stock.image)}
                                thumbnail
                                style={{ width: '140px', height: '140px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => document.getElementById(`stock-edit-file-input-${index}`).click()}
                                alt={`${label} ${index + 1}`}
                            />
                            {/* Hidden file input for editing a specific stock image */}
                            <Form.Control
                                type="file"
                                accept="image/*"
                                className="d-none"
                                id={`stock-edit-file-input-${index}`}
                                onChange={(e) => handleFileChange(e, index)}
                            />
                            <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-1"
                                onClick={() => onRemoveStockImage(index)}
                                style={{ zIndex: 10 }}
                            >
                                <FaTimes />
                            </Button>
                            <div className="mt-2">
                                <Form.Control
                                    type="text"
                                    placeholder="색상"
                                    value={stock.color || ''}
                                    onChange={(e) => onUpdateStockItem(index, 'color', e.target.value)}
                                    className="mb-2"
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="사이즈"
                                    value={stock.size || ''}
                                    onChange={(e) => onUpdateStockItem(index, 'size', e.target.value)}
                                    className="mb-2"
                                />
                                <Form.Control
                                    type="number"
                                    placeholder="수량"
                                    value={stock.quantity || 0}
                                    onChange={(e) => onUpdateStockItem(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                                    min="0"
                                />
                            </div>
                        </div>
                    ))}
                    <div
                        className="d-flex flex-column justify-content-center align-items-center border border-2 border-secondary rounded p-3"
                        style={{ width: '150px', height: '150px', cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => document.getElementById(`add-stock-file-input`).click()}
                    >
                        <FaCamera size={30} className="text-secondary mb-2" />
                        <span className="text-secondary">새 재고 이미지 추가</span>
                        {/* Hidden file input for adding new stock images */}
                        <Form.Control
                            type="file"
                            multiple
                            accept="image/*"
                            className="d-none"
                            id={`add-stock-file-input`}
                            onChange={onAddStockImage}
                        />
                    </div>
                </div>
            </Col>
        </Form.Group>
    );
};

export default MultipleStockImageEditor;