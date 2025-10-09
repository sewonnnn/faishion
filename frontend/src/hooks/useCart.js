import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx'; // useAuth 가져오기

const useCart = () => {
    const { api } = useAuth(); // 인증된 axios 인스턴스 사용
    const [cartList, setCartList] = useState([]);

    // 장바구니 데이터 불러오는 함수
    const fetchCartData = async () => {
        try {
            const response = await api.get('/cart/list');
            console.log(response.data);
            setCartList(response.data);
        } catch (error) {
            console.error("장바구니 데이터를 가져오는 중 오류 발생:", error);
            setCartList([]);
        }
    };

    // 컴포넌트가 처음 마운트될 때 데이터를 불러옴
    useEffect(() => {
        fetchCartData();
    }, [api]); // api 객체에 의존성 추가

    // 외부에서 사용할 값과 함수를 반환함
    return {
        cartList,
        fetchCartData,
    };
};

export default useCart;