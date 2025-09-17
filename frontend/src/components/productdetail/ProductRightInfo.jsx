import "./ProductRightInfo.css";
import Form from 'react-bootstrap/Form';
import {Button} from "react-bootstrap";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import axios from "axios";



const ProductRightInfo = ({productId}) => {
    const nav = useNavigate();

    const [product, setProduct] = useState(productId);
    const [quantity, setQuantity] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    // AI 입어보기 폼으로 이동
    const onAIForm = (productId) => {
        nav(`/gemini/${productId}`);
    }

    // 결제하기 폼으로 이동
    const onOrderForm = (productId) => {
        nav(`/order/new/${productId}`);
    }

    // // 장바구니 담기 메서드
    // const onCartSave = (productId) => async () => {
    //     if (!product || !product.id) {
    //         alert('상품 정보를 불러오는 중 오류가 발생했습니다.');
    //         return;
    //     }
    //     if (!selectedColor || !selectedSize) {
    //         alert('색상과 사이즈를 선택해주세요.');
    //         return;
    //     }
    //
    //     try {
    //         const response = await axios.post('/api/cart/add', {
    //             productId: product.id,
    //             quantity: quantity,
    //             color: selectedColor,
    //             size: selectedSize,
    //         }, {
    //             // JWT 토큰이 필요한 경우 헤더에 추가
    //             headers: {
    //                 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`, // 예시: 토큰 저장 방식에 따라 다름
    //                 'Content-Type': 'application/json'
    //             }
    //         });
    //
    //         if (response.data.success) { // 백엔드 응답에 success 필드가 있다고 가정
    //             alert('장바구니에 상품이 담겼습니다!');
    //             // 장바구니 아이콘 개수 업데이트 등 UI 로직 추가
    //         } else {
    //             alert('장바구니 담기에 실패했습니다. 다시 시도해주세요.');
    //         }
    //     } catch (error) {
    //         console.error('장바구니 담기 오류:', error);
    //         // API 오류 시 메시지 표시
    //         if (error.response && error.response.status === 401) {
    //             alert('로그인이 필요합니다.');
    //             // 로그인 페이지로 리다이렉트
    //         } else {
    //             alert('서버 오류가 발생했습니다.');
    //         }
    //     }
    // }
        return (
            <div className={"ProductRightInfo"}>
                <div className={"ProductRightInfoTitle"}>
                    <h3><strong>상품명</strong></h3>
                    <p>상품 컬러(정보)</p>
                </div>
                <div className={"price-form"}>
                    <h4>63000</h4>
                    <Button variant="primary" onClick={() => onAIForm(product)}>AI로 옷입으러가기</Button>
                </div>
                <div className={"color-form"}>
                    <ToggleButtonGroup type="radio" name="options" defaultValue={1}>
                        <ToggleButton id="tbg-radio-1" value={1}>
                            RED
                        </ToggleButton>
                        <ToggleButton id="tbg-radio-2" value={2}>
                            BLUE
                        </ToggleButton>
                        <ToggleButton id="tbg-radio-3" value={3}>
                            YELLOW
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <div className={"select-form"}>
                    <Form.Select size={"sm"} aria-label="Default select example">
                        <option>사이즈</option>
                        <option value="1">S</option>
                        <option value="2">M</option>
                        <option value="3">L</option>
                    </Form.Select>
                </div>
                <div className={"cash-form"}>
                    <Button variant="secondary" onClick={()=> onCartSave(product)}>장바구니</Button>
                    <Button variant="primary" onClick={() => onOrderForm(product)}>결제하기</Button>
                </div>
            </div>
        )
    }
export default ProductRightInfo;