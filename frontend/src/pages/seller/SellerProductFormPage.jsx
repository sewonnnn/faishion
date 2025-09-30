import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from "react-router-dom";
import CategorySelector from "../../components/seller/productform/CategorySelector.jsx";
import MultipleImageUploader from "../../components/seller/productform/MultipleImageUploader.jsx";
import MultipleStockImageUploader from "../../components/seller/productform/MultipleStockImageUploader.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

// 이미지 객체를 생성하는 헬퍼 함수 (등록 페이지에서는 항상 ID/URL이 null)
const createFileImageObj = (file) => ({ id: null, file: file, url: null });
const updateFileImageObj = (id, file) => ({ id : id, file : file, url : null});
const createUrlImageObj = (id) => ({ id: id, file: null, url: `http://localhost:8080/image/${id}` });
const createStockImageObj = (stock) => ({
    id: stock.id || null, // 재고 ID
    quantity: stock.quantity || 0,
    color: stock.color || '',
    size: stock.size || '',
    image: createUrlImageObj(stock.image)
});

const SellerProductFormPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 백엔드에서 받은 데이터 구조에 맞춰 product, imageList, stockList를 가져옵니다.
    const { product: initialProduct } = location.state || {};

    // 1. 초기 상태 설정: 객체 구조를 통일합니다.
    const [product, setProduct] = useState({
        id: initialProduct?.id || null,
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
    const [selectedGroup, setSelectedGroup] = useState(String(initialProduct?.category?.categoryGroup?.id || ''));
    const [selectedCategory, setSelectedCategory] = useState(String(initialProduct?.category?.id || ''));
    const { api } = useAuth();

    const [deletedImageIds, setDeletedImageIds] = useState({
        main: [],
        detail: [],
        stock: [],
    });

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
    }, [api]); // api 의존성 추가

    // (handleChange, handlePriceBlur, handleDiscountPriceBlur, handleCategory...Change 는 변경 없음)
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
    // 이미지/재고 핸들러 수정: 객체 구조에 맞춰 파일 관리
    // -------------------------------------------------------------------------

    // 이미지 추가: 파일 객체로 변환하여 추가
    const handleMainImageChange = (e) => {
        const files = Array.from(e.target.files).map(createFileImageObj);
        if (files.length > 0) {
            setProduct((prevProduct) => ({
                ...prevProduct,
                mainImages: [...prevProduct.mainImages, ...files],
            }));
        }
    };

    // 이미지 삭제: (ID 관리가 필요 없어 단순 제거)
    const handleRemoveMainImage = (index) => {
        setProduct((prevProduct) => {
            const removedImage = prevProduct.mainImages[index];
            if (removedImage.id !== null) {
                setDeletedImageIds(prevDeleted => ({
                    ...prevDeleted,
                    main: [...prevDeleted.main, removedImage.id],
                }));
            }
            return {
                ...prevProduct,
                mainImages: prevProduct.mainImages.filter((_, i) => i !== index),
            };
        });
    };

    // 이미지 교체: 새 파일 객체로 대체
    const handleReplaceMainImage = (index, newFile) => {
        setProduct((prevProduct) => {
            const newMainImages = [...prevProduct.mainImages];
            newMainImages[index] = updateFileImageObj(newMainImages[index].id, newFile);
            return {
                ...prevProduct,
                mainImages: newMainImages,
            };
        });
    };

    // 상세 이미지 핸들러 (대표 이미지와 로직 동일)
    const handleDetailImageChange = (e) => {
        const files = Array.from(e.target.files).map(createFileImageObj);
        if (files.length > 0) {
            setProduct((prevProduct) => ({
                ...prevProduct,
                detailImages: [...prevProduct.detailImages, ...files],
            }));
        }
    };

    const handleRemoveDetailImage = (index) => {
        setProduct((prevProduct) => ({
            ...prevProduct,
            detailImages: prevProduct.detailImages.filter((_, i) => i !== index),
        }));
    };

    const handleReplaceDetailImage = (index, newFile) => {
        setProduct((prevProduct) => {
            const newDetailImages = [...prevProduct.detailImages];
            newDetailImages[index] = updateFileImageObj(newDetailImages[index].id, newFile);
            return {
                ...prevProduct,
                detailImages: newDetailImages,
            };
        });
    };

    // 재고 추가: 새 재고/이미지 객체로 변환하여 추가
    const handleAddStockImage = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            const newStock = Array.from(files).map(file => ({
                id: null, // 새 재고
                image: createFileImageObj(file), // 새 이미지 객체
                quantity: 0, // count -> quantity로 통일
                color: '',
                size: '',
            }));
            setProduct((prevProduct) => ({
                ...prevProduct,
                stocks: [...prevProduct.stocks, ...newStock],
            }));
        }
    };

    const handleRemoveStockImage = (index) => {
        setProduct((prevProduct) => ({
            ...prevProduct,
            stocks: prevProduct.stocks.filter((_, i) => i !== index),
        }));
    };

    const handleUpdateStockItem = (index, key, value) => {
        const stockKey = key === 'count' ? 'quantity' : key;
        setProduct((prevProduct) => ({
            ...prevProduct,
            stocks: prevProduct.stocks.map((stock, i) =>
                i === index ? { ...stock, [stockKey]: value } : stock
            ),
        }));
    };

    // 재고 이미지 교체: 새 파일 객체로 대체
    const handleReplaceStockImage = (index, newFile) => {
        setProduct((prevProduct) => {
            const newStocks = [...prevProduct.stocks];
            newStocks[index] = {
                ...newStocks[index],
                image: updateFileImageObj(newStocks[index].id ,newFile)
            };
            return {
                ...prevProduct,
                stocks: newStocks,
            };
        });
    };
    // -------------------------------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        const price = Number(product.price);
        const discountPrice = Number(product.discountPrice);
        const { discountStartDate, discountEndDate, category } = product;

        if (!category) {
            alert('상품 카테고리를 선택해야 합니다.');
            return;
        }
        if (product.mainImages.length === 0) {
            alert('상품 대표 이미지를 1개 이상 등록해야 합니다.');
            return;
        }
        if (product.detailImages.length === 0) {
            alert('상품 상세 이미지를 1개 이상 등록해야 합니다.');
            return;
        }
        if (product.stocks.length === 0) {
            alert('상품 재고 이미지를 1개 이상 등록해야 합니다.');
            return;
        }
        if (discountPrice > 0) {
            if (!discountStartDate || !discountEndDate || new Date(discountEndDate) <= new Date(discountStartDate)) {
                alert('할인 기간을 정확히 입력해야 합니다.');
                return;
            }
        }
        if (discountPrice > price) {
            alert('할인 금액은 상품 가격보다 클 수 없습니다. 상품 정보를 다시 확인해주세요.');
            return;
        }
        for (const stock of product.stocks) {
            if (stock.color.trim() === '' || stock.size.trim() === '') {
                alert('모든 재고에 대한 색상과 사이즈를 입력해야 합니다.');
                return;
            }
        }
        const formData = new FormData();
        const productData = {
            id: product.id,
            name: product.name,
            status: product.status,
            description: product.description,
            price: product.price,
            category: product.category,
            discountPrice: product.discountPrice,
            discountStartDate: product.discountStartDate,
            discountEndDate: product.discountEndDate,
        };
        formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

        const mainImagesWithFile = product.mainImages.filter(img => img.file);
        const mainInfos = mainImagesWithFile.map((mainInfo, idx) => ({
            imageId : mainInfo.id,
            imageFileIdx : mainImagesWithFile.findIndex(img => img.id === mainInfo.id || img.file === mainInfo.file) // 파일이 있는 경우에만 index를 부여하도록 수정
        }));
        formData.append('mainInfos', new Blob([JSON.stringify(mainInfos)], { type: 'application/json' }));
        mainImagesWithFile.forEach((image) => {
            formData.append('mainImages', image.file);
        });

        const detailImagesWithFile = product.detailImages.filter(img => img.file);
        const detailInfos = detailImagesWithFile.map((detailInfo, idx) => ({
            imageId : detailInfo.id,
            imageFileIdx : detailImagesWithFile.findIndex(img => img.id === detailInfo.id || img.file === detailInfo.file)
        }));
        formData.append('detailInfos', new Blob([JSON.stringify(detailInfos)], { type: 'application/json' }));
        detailImagesWithFile.forEach((image) => {
            formData.append('detailImages', image.file);
        });
        const stocksPayload = product.stocks.map((stock) => ({
            id : stock.id,
            quantity: stock.quantity,
            color: stock.color,
            size: stock.size
        }));
        formData.append('stocks', new Blob([JSON.stringify(stocksPayload)], { type: 'application/json' }));
        const stocksWithFile = product.stocks.filter(stock => stock.image.file);
        const stockInfos = stocksWithFile.map((stock, idx) => ({
            imageId : stock.image.id,
            imageFileIdx : idx
        }));
        formData.append('stockInfos', new Blob([JSON.stringify(stockInfos)], { type: 'application/json' }));
        stocksWithFile.forEach((stock)=>{
            formData.append('stockImages', stock.image.file);
        });
        if (initialProduct) {
            const currMainIds = product.mainImages.map(item => item.id);
            const currDetailIds = product.detailImages.map(item => item.id);
            const currStocks = product.stocks.map(item => item.id);
            const deletedMainImageIds = initialProduct.mainImageList.filter(id => !currMainIds.includes(id));
            const deletedDetailImageIds = initialProduct.detailImageList.filter(id => !currDetailIds.includes(id));
            const deletedStockIds = initialProduct.stockList.map(stock => stock.id).filter(id => !currStocks.includes(id));
            formData.append('deletedMainImageIds', new Blob([JSON.stringify(deletedMainImageIds)], { type: 'application/json' }));
            formData.append('deletedDetailImageIds', new Blob([JSON.stringify(deletedDetailImageIds)], { type: 'application/json' }));
            formData.append('deletedStockIds', new Blob([JSON.stringify(deletedStockIds)], { type: 'application/json' }));
        }
        try {
            let response;
            if(!initialProduct){
                response = await api.post('/product', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }else{
                response = await api.put('/product', formData, {
                     headers: {
                         'Content-Type': 'multipart/form-data',
                     },
                 });
            }
            console.log('Product registered successfully:', response.data);
            alert('상품이 성공적으로 등록되었습니다.');
        } catch (error) {
            console.error('Error registering product:', error.response ? error.response.data : error.message);
            alert('상품 등록 중 오류가 발생했습니다.');
        }
    };

    const showDiscountPeriod = product.discountPrice && Number(product.discountPrice) > 0;

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">상품 등록</h2>
            <Form onSubmit={handleSubmit}>
                {/* ... (폼 필드는 변경 없음) ... */}

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

                {/* ---------------------------------------------------------------------------------- */}
                {/* 이미지 업로더: props 명칭 통일 (onUpdateImage -> onReplaceImage) */}
                <MultipleImageUploader
                    label="상품 대표 이미지"
                    images={product.mainImages}
                    onAddImage={handleMainImageChange}
                    onRemoveImage={handleRemoveMainImage}
                    onReplaceImage={handleReplaceMainImage}
                />

                <MultipleImageUploader
                    label="상품 상세 이미지"
                    images={product.detailImages}
                    onAddImage={handleDetailImageChange}
                    onRemoveImage={handleRemoveDetailImage}
                    onReplaceImage={handleReplaceDetailImage}
                />

                {/* 재고 이미지 업로더: props 명칭 통일 (onUpdateStockImage -> onReplaceStockImage) */}
                <MultipleStockImageUploader
                    label="상품 재고 이미지"
                    stocks={product.stocks}
                    onAddStockImage={handleAddStockImage}
                    onRemoveStockImage={handleRemoveStockImage}
                    onUpdateStockItem={handleUpdateStockItem}
                    onReplaceStockImage={handleReplaceStockImage}
                />
                {/* ---------------------------------------------------------------------------------- */}

                <Row className="mt-4">
                    <Col className="text-center">
                        <Button variant="secondary" onClick={() => navigate('/seller/list')} className="me-3">
                            메인으로 가기
                        </Button>
                        <Button variant="success" type="submit">
                            등록하기
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default SellerProductFormPage;