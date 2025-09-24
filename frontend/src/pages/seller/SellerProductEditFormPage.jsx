import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from "react-router-dom";
import CategorySelector from "../../components/seller/productform/CategorySelector.jsx";
// 컴포넌트 파일명을 수정했을 수도 있으므로, 여기서는 기존 이름을 유지합니다.
import MultipleImageUploader from "../../components/seller/productform/MultipleImageUploader.jsx";
import MultipleStockImageUploader from "../../components/seller/productform/MultipleStockImageUploader.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

// 이미지 객체를 생성하는 헬퍼 함수
const createFileImageObj = (file) => ({ id: null, file: file, url: null });
const createUrlImageObj = (id) => ({ id: id, file: null, url: `http://localhost:8080/image/${id}` });
const createStockImageObj = (stock) => ({
    id: stock.id || null, // 재고 ID
    quantity: stock.quantity || 0,
    color: stock.color || '',
    size: stock.size || '',
    image: createUrlImageObj(stock.image)
});

const SellerProductEditFormPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // 백엔드에서 받은 데이터 구조에 맞춰 product, imageList, stockList를 가져옵니다.
    const { product: initialProduct } = location.state || {};

    // 1. 초기 상태 설정: 객체 구조를 통일합니다.
    const [product, setProduct] = useState({
        name: initialProduct?.name || '',
        status: initialProduct?.status || 1,
        description: initialProduct?.description || '',
        price: initialProduct?.price || '',
        category: initialProduct?.category || null,
        discountPrice: initialProduct?.discountPrice || '',
        discountStartDate: initialProduct?.discountStartDate || '',
        discountEndDate: initialProduct?.discountEndDate || '',
        // 이미지 목록 초기화: 기존 URL/ID를 객체 형태로 변환
        mainImages: (initialProduct?.mainImageList || []).map(img => createUrlImageObj(img)),
        detailImages: (initialProduct?.detailImageList || []).map(img => createUrlImageObj(img)),
        // 재고 목록 초기화: 재고 객체와 재고 이미지 객체로 변환 (count -> quantity)
        stocks: (initialProduct?.stockList || []).map(createStockImageObj),
    });

    const [categoryGroups, setCategoryGroups] = useState([]);
    // 카테고리 그룹 및 카테고리 ID를 문자열로 초기화
    const [selectedGroup, setSelectedGroup] = useState(String(initialProduct?.category?.categoryGroup?.id || ''));
    const [selectedCategory, setSelectedCategory] = useState(String(initialProduct?.category?.id || ''));

    const { api } = useAuth();

    // 제거된 기존 이미지/재고의 ID만 추적합니다.
    const [removedImageIds, setRemovedImageIds] = useState({
        main: [],
        detail: [],
        stock: [],
    });



    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategoryGroups = async () => {
            try {
                const response = await api.get('/category/groups');
                setCategoryGroups(response.data);
            } catch (error) {
                console.error("Error fetching category groups:", error);
            }
        };
        fetchCategoryGroups();
    }, [api]);

    useEffect(()=>{
        console.log(product, removedImageIds);
    }, [product, removedImageIds]);

    const handleChange = (e) => {
            const { name, value } = e.target;

            if (name === 'price' || name === 'discountPrice') {
                const numericValue = value.replace(/[^0-9]/g, '');
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    [name]: numericValue,
                }));
            } else if (name === 'status') {
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    status: parseInt(value, 10),
                }));
            } else {
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    [name]: value,
                }));
            }
        };

        const handlePriceBlur = (e) => {
            const { name } = e.target;
            const price = Number(product.price);
            const discountPrice = Number(product.discountPrice);

            if (name === 'price' && discountPrice > price) {
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    discountPrice: '',
                }));
                alert('할인 금액은 상품 가격보다 클 수 없습니다. 할인 금액이 초기화됩니다.');
            }
        };

        const handleDiscountPriceBlur = (e) => {
            const price = Number(product.price);
            const discountPrice = Number(e.target.value);

            if (discountPrice > price) {
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    discountPrice: '',
                }));
                alert('할인 금액은 상품 가격보다 클 수 없습니다.');
            }
        };

        const handleCategoryGroupChange = (e) => {
            const groupId = e.target.value;
            setSelectedGroup(groupId);
            setSelectedCategory('');
            setProduct((prevProduct) => ({
                ...prevProduct,
                category: null,
            }));
        };

        const handleSubCategoryChange = (e) => {
            const categoryId = e.target.value;
            setSelectedCategory(categoryId);
            setProduct((prevProduct) => ({
                ...prevProduct,
                category: { id: categoryId },
            }));
        };


    // -------------------------------------------------------------------------
    // 2. 이미지/재고 핸들러 수정: 객체 구조에 맞춰 파일/ID 관리
    // -------------------------------------------------------------------------

    // 이미지 추가: 새 파일 객체로 변환하여 추가
    const handleMainImageChange = (e) => {
        const files = Array.from(e.target.files).map(createFileImageObj);
        setProduct((prevProduct) => ({ ...prevProduct, mainImages: [...prevProduct.mainImages, ...files] }));
    };

    // 이미지 삭제: 기존 이미지인 경우 ID를 제거 목록에 추가
    const handleRemoveMainImage = (index) => {
        const imageToRemove = product.mainImages[index];
        if (imageToRemove.id) { // ID가 있으면 기존 이미지이므로 제거 목록에 추가
            setRemovedImageIds(prev => ({ ...prev, main: [...prev.main, imageToRemove.id] }));
        }
        setProduct((prevProduct) => ({
            ...prevProduct,
            mainImages: prevProduct.mainImages.filter((_, i) => i !== index)
        }));
    };

    // 이미지 교체: 기존 이미지인 경우 ID를 제거 목록에 추가하고, 새 파일 객체로 대체
    const handleReplaceMainImage = (index, file) => {
        const oldImage = product.mainImages[index];
        if (oldImage.id) { // ID가 있으면 기존 이미지이므로 제거 목록에 추가
            setRemovedImageIds(prev => ({ ...prev, main: [...prev.main, oldImage.id] }));
        }
        setProduct((prevProduct) => {
            const newImages = [...prevProduct.mainImages];
            // ID를 null로, file을 새 파일로, url을 null로 설정
            newImages[index] = createFileImageObj(file);
            return { ...prevProduct, mainImages: newImages };
        });
    };

    // 상세 이미지 핸들러 (대표 이미지와 로직 동일)
    const handleDetailImageChange = (e) => {
        const files = Array.from(e.target.files).map(createFileImageObj);
        setProduct((prevProduct) => ({ ...prevProduct, detailImages: [...prevProduct.detailImages, ...files] }));
    };

    const handleRemoveDetailImage = (index) => {
        const imageToRemove = product.detailImages[index];
        if (imageToRemove.id) {
            setRemovedImageIds(prev => ({ ...prev, detail: [...prev.detail, imageToRemove.id] }));
        }
        setProduct((prevProduct) => ({ ...prevProduct, detailImages: prevProduct.detailImages.filter((_, i) => i !== index) }));
    };

    const handleReplaceDetailImage = (index, file) => {
        const oldImage = product.detailImages[index];
        if (oldImage.id) {
            setRemovedImageIds(prev => ({ ...prev, detail: [...prev.detail, oldImage.id] }));
        }
        setProduct((prevProduct) => {
            const newImages = [...prevProduct.detailImages];
            newImages[index] = createFileImageObj(file);
            return { ...prevProduct, detailImages: newImages };
        });
    };

    // 재고 추가: 새 재고/이미지 객체로 변환하여 추가
    const handleAddStockImage = (e) => {
        const files = Array.from(e.target.files);
        const newStocks = files.map(file => ({
            id: null, // 새 재고
            quantity: 0,
            color: '',
            size: '',
            image: createFileImageObj(file) // 새 이미지 객체
        }));
        setProduct((prevProduct) => ({ ...prevProduct, stocks: [...prevProduct.stocks, ...newStocks] }));
    };

    // 재고 삭제: 기존 재고인 경우 ID를 제거 목록에 추가
    const handleRemoveStockImage = (index) => {
        const stockToRemove = product.stocks[index];
        if (stockToRemove.id) { // 재고 ID가 있으면 제거 목록에 추가
            setRemovedImageIds(prev => ({ ...prev, stock: [...prev.stock, stockToRemove.id] }));
        }
        setProduct((prevProduct) => ({ ...prevProduct, stocks: prevProduct.stocks.filter((_, i) => i !== index) }));
    };

    // 재고 정보 업데이트 (count -> quantity)
    const handleUpdateStockItem = (index, key, value) => {
        setProduct((prevProduct) => ({
            ...prevProduct,
            stocks: prevProduct.stocks.map((stock, i) =>
                i === index ? { ...stock, [key]: value } : stock
            ),
        }));
    };

    // 재고 이미지 교체: 기존 이미지인 경우 ID를 제거 목록에 추가하고, 새 파일 객체로 대체
    const handleReplaceStockImage = (index, file) => {
        const oldImage = product.stocks[index].image;
        if (oldImage.id) { // 재고 이미지 ID가 있으면 제거 목록에 추가 (서버에서 재고 이미지 ID로 처리한다고 가정)
            setRemovedImageIds(prev => ({ ...prev, stock: [...prev.stock, oldImage.id] }));
        }
        setProduct((prevProduct) => {
            const newStocks = [...prevProduct.stocks];
            // 이미지 객체를 새 파일 객체로 교체
            newStocks[index] = {
                ...newStocks[index],
                image: createFileImageObj(file)
            };
            return { ...prevProduct, stocks: newStocks };
        });
    };

    // -------------------------------------------------------------------------
    // 3. 폼 제출 (`handleSubmit`) 로직 수정: 이미지/재고 객체 분리 및 FormData 구성
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {

        // ... (유효성 검사 로직 유지) ...
        e.preventDefault();

        const price = Number(product.price);
        const discountPrice = Number(product.discountPrice);
        const { discountStartDate, discountEndDate, stocks, category } = product;

        if (!category || product.mainImages.length === 0 || product.detailImages.length === 0 || product.stocks.length === 0) {
             alert('필수 입력 항목 (카테고리, 이미지, 재고)을 확인해주세요.');
             return;
        }

        if (discountPrice > 0) {
            // 할인 기간 검사
            if (!discountStartDate || !discountEndDate || new Date(discountEndDate) <= new Date(discountStartDate)) {
                 alert('할인 기간을 정확히 입력해주세요.');
                 return;
            }
        }
        if (discountPrice > price) {
            alert('할인 금액은 상품 가격보다 클 수 없습니다.');
            return;
        }
        for (const stock of stocks) {
             if (stock.color.trim() === '' || stock.size.trim() === '') {
                 alert('모든 재고에 대한 색상과 사이즈를 입력해야 합니다.');
                 return;
             }
        }

        const formData = new FormData();

        // 3-1. 이미지 분리: 새로운 파일 객체 vs 기존 ID를 가진 객체
        const newMainImages = product.mainImages.filter(img => img.file);
        const newDetailImages = product.detailImages.filter(img => img.file);
        const existingMainImageIds = product.mainImages.filter(img => img.id).map(img => img.id);
        const existingDetailImageIds = product.detailImages.filter(img => img.id).map(img => img.id);

        // 3-2. 재고 분리: 신규 재고 vs 기존 재고
        const newStocks = product.stocks.filter(stock => !stock.id);
        const existingStocks = product.stocks.filter(stock => stock.id);

        // 3-3. DTO 구성
        const updatedProductData = {
            id: initialProduct.id,
            name: product.name,
            status: product.status,
            description: product.description,
            price: product.price,
            category: product.category,
            discountPrice: product.discountPrice,
            discountStartDate: product.discountStartDate,
            discountEndDate: product.discountEndDate,
        };
        formData.append('product', new Blob([JSON.stringify(updatedProductData)], { type: 'application/json' }));
        const updatedStockData = existingStocks.map(stock => ({
            id: stock.id,
            quantity: stock.quantity,
            color: stock.color,
            size: stock.size,
        }));
        formData.append('stockList', new Blob([JSON.stringify(updatedStockData)], { type: 'application/json' }));
        const newStockData = newStocks.map(stock => ({
            quantity: stock.quantity,
            color: stock.color,
            size: stock.size,
        }));
        formData.append('newStockList', new Blob([JSON.stringify(newStockData)], { type: 'application/json' })); // 신규 재고

/*
        // 신규 이미지 파일 Append (new: 새로 추가되거나 교체된 파일)
        newMainImages.forEach((image) => {
            formData.append('newMainImages', image.file);
        });

        newDetailImages.forEach((image) => {
            formData.append('newDetailImages', image.file);
        });

        // 신규 재고 이미지 파일 Append
        newStocks.forEach((stock) => {
            formData.append('newStockImages', stock.image.file);
        });

        // 교체된 재고 이미지 파일 Append
        existingStocks.filter(stock => stock.image.file).forEach((stock) => {
            formData.append('updatedStockImages', stock.image.file);
        });
    */

        // 3-5. API 요청 (PUT)
        try {
            const response = await api.put('/product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Product updated successfully:', response.data);
            alert('상품이 성공적으로 수정되었습니다.');
            navigate('/seller/product/list');
        } catch (error) {
            console.error('Error updating product:', error.response ? error.response.data : error.message);
            alert('상품 수정 중 오류가 발생했습니다.');
        }
    };

    const showDiscountPeriod = product.discountPrice && Number(product.discountPrice) > 0;

    if (!initialProduct || !initialProduct.id) {
        return <Container className="my-5"><h2 className="text-center">상품 정보를 불러오는 중...</h2></Container>;
    }

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">상품 수정</h2>
            <Form onSubmit={handleSubmit}>
                {/* ... (폼 입력 필드 유지) ... */}

                <Form.Group as={Row} className="mb-3" controlId="formProductName">
                    <Form.Label column sm="2">상품명 :</Form.Label>
                    <Col sm="10">
                        <Form.Control type="text" name="name" value={product.name} onChange={handleChange} placeholder="상품명 입력" required/>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formProductDescription">
                    <Form.Label column sm="2">상품 설명 :</Form.Label>
                    <Col sm="10">
                        <Form.Control as="textarea" name="description" value={product.description} onChange={handleChange} placeholder="상품 설명 입력" rows={5} required/>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formProductStatus">
                    <Form.Label column sm="2">판매 상태 :</Form.Label>
                    <Col sm="10">
                        <Form.Select name="status" value={product.status} onChange={handleChange}>
                            <option value={1}>판매 게시</option>
                            <option value={0}>판매 중지</option>
                        </Form.Select>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formProductPrice">
                    <Form.Label column sm="2">상품 가격 :</Form.Label>
                    <Col sm="10">
                        <Form.Control type="number" name="price" value={product.price} onChange={handleChange} onBlur={handlePriceBlur} placeholder="상품 가격 입력" required/>
                    </Col>
                </Form.Group>

                <CategorySelector
                    categoryGroups={categoryGroups}
                    selectedGroup={selectedGroup}
                    selectedCategory={selectedCategory}
                    onGroupChange={handleCategoryGroupChange}
                    onCategoryChange={handleSubCategoryChange}
                />

                <Form.Group as={Row} className="mb-3" controlId="formProductDiscountPrice">
                    <Form.Label column sm="2">할인 금액 :</Form.Label>
                    <Col sm="10">
                        <Form.Control type="number" name="discountPrice" value={product.discountPrice} onChange={handleChange} onBlur={handleDiscountPriceBlur} placeholder="할인 금액 입력"/>
                    </Col>
                </Form.Group>

                {showDiscountPeriod && (
                    <Form.Group as={Row} className="mb-3" controlId="formProductDiscountPeriod">
                        <Form.Label column sm="2">할인 기간 :</Form.Label>
                        <Col sm="10">
                            <Row>
                                <Col xs={5}>
                                    <Form.Control type="datetime-local" name="discountStartDate" value={product.discountStartDate} onChange={handleChange}/>
                                </Col>
                                <Col xs={2} className="text-center"> ~ </Col>
                                <Col xs={5}>
                                    <Form.Control type="datetime-local" name="discountEndDate" value={product.discountEndDate} onChange={handleChange}/>
                                </Col>
                            </Row>
                        </Col>
                    </Form.Group>
                )}

                {/* Image Uploaders: props 이름 수정 */}
                <MultipleImageUploader
                    label="상품 대표 이미지"
                    images={product.mainImages}
                    onAddImage={handleMainImageChange}
                    onRemoveImage={handleRemoveMainImage}
                    onReplaceImage={handleReplaceMainImage} // onEditImage -> onReplaceImage
                />

                <MultipleImageUploader
                    label="상품 상세 이미지"
                    images={product.detailImages}
                    onAddImage={handleDetailImageChange}
                    onRemoveImage={handleRemoveDetailImage}
                    onReplaceImage={handleReplaceDetailImage} // onEditImage -> onReplaceImage
                />

                <MultipleStockImageUploader
                    label="상품 재고 이미지"
                    stocks={product.stocks}
                    onAddStockImage={handleAddStockImage}
                    onRemoveStockImage={handleRemoveStockImage}
                    onUpdateStockItem={handleUpdateStockItem}
                    onReplaceStockImage={handleReplaceStockImage} // onEditStockImage -> onReplaceStockImage
                />

                <Row className="mt-4">
                    <Col className="text-center">
                        <Button variant="secondary" onClick={() => navigate('/seller/product/list')} className="me-3">
                            취소
                        </Button>
                        <Button variant="success" type="submit">
                            수정하기
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default SellerProductEditFormPage;