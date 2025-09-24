// src/components/seller/productform/MultipleImageUploader.jsx
import React from 'react';
import { Button, Row, Col, Form, Image } from 'react-bootstrap';
import { FaTimes, FaCamera } from 'react-icons/fa';

const MultipleImageEditor = ({ images, onAddImage, onRemoveImage, onEditImage, label }) => {

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            onEditImage(index, file);
        }
    };

    return (
        <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">{label} :</Form.Label>
            <Col sm="10">
                <div className="d-flex flex-wrap gap-2">
                    {images.map((image, index) => (
                        <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                            <Image
                                src={typeof image === 'string' ? `http://localhost:8080/image/${image}` : URL.createObjectURL(image)}
                                thumbnail
                                style={{ width: '100px', height: '100px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => document.getElementById(`edit-file-input-${index}`).click()}
                                alt={`${label} ${index + 1}`}
                            />
                            {/* Hidden file input for editing a specific image */}
                            <Form.Control
                                type="file"
                                accept="image/*"
                                className="d-none"
                                id={`edit-file-input-${index}`}
                                onChange={(e) => handleFileChange(e, index)}
                            />
                            <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-1"
                                onClick={() => onRemoveImage(index)}
                                style={{ zIndex: 10 }}
                            >
                                <FaTimes />
                            </Button>
                        </div>
                    ))}
                    <div
                        className="d-flex flex-column justify-content-center align-items-center border border-2 border-secondary rounded p-3"
                        style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                        onClick={() => document.getElementById(`add-file-input`).click()}
                    >
                        <FaCamera size={30} className="text-secondary mb-2" />
                        <span className="text-secondary">추가</span>
                        {/* Hidden file input for adding new images */}
                        <Form.Control
                            type="file"
                            multiple
                            accept="image/*"
                            className="d-none"
                            id={`add-file-input`}
                            onChange={onAddImage}
                        />
                    </div>
                </div>
            </Col>
        </Form.Group>
    );
};

export default MultipleImageEditor;