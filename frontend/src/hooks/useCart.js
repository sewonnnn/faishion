/*
import { useEffect, useState } from 'react';
import axios from 'axios';

// 장바구니 데이터를 관리하는 커스텀 훅
const useCart = () => {
    const [cartList, setCartList] = useState([]);

    const [totalOriginalPrice, setTotalOriginalPrice] = useState(0);
    const [totalDiscountedPrice, setTotalDiscountedPrice] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);

    // 장바구니 데이터 불러오는 함수
    const fetchCartData = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8080/cart/list'
            );
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
    }, []);

    // cartList가 변경될 때마다 금액을 다시 계산
    useEffect(() => {
        const calculatedTotalOriginalPrice = cartList.reduce((acc, item) => {
            return acc + (item.productPrice * item.quantity);
        }, 0);
        setTotalOriginalPrice(calculatedTotalOriginalPrice);

        const calculatedTotalDiscountedPrice = cartList.reduce((acc, item) => {
            return acc + (item.discountedProductPrice * item.quantity);
        }, 0);
        setTotalDiscountedPrice(calculatedTotalDiscountedPrice);

        setTotalDiscount(calculatedTotalOriginalPrice - calculatedTotalDiscountedPrice);
    }, [cartList]);

    // 외부에서 사용할 값과 함수를 반환함
    return {
        cartList,
        totalOriginalPrice,
        totalDiscountedPrice,
        totalDiscount,
        fetchCartData,
    };
};

export default useCart;*/
// src/hooks/useCart.js

import { useState, useEffect } from 'react';
import axios from 'axios';
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