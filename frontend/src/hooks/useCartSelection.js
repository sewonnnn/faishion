import { useState, useEffect } from 'react';
import {useAuth} from "../contexts/AuthContext.jsx";

const useCartSelection = (cartList, fetchCartData) => {
    // 선택된 상품 ID
    const [selectedItems, setSelectedItems] = useState([]);

    const {api} = useAuth();
    // 전체 선택 체크박스 상태
    const [isAllSelected, setIsAllSelected] = useState(false);

    // 개별 체크박스 상태 변경
    const handleCheckboxChange = (itemId) => {
        setSelectedItems(prevSelected => {
            if (prevSelected.includes(itemId)) {
                return prevSelected.filter(id => id !== itemId);
            } else {
                return [...prevSelected, itemId];
            }
        });
    };

    // 전체 선택 체크박스 상태 변경
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItems([]);
        } else {
            const allItemIds = cartList.map(item => item.id);
            setSelectedItems(allItemIds);
        }
        setIsAllSelected(!isAllSelected);
    };

    // 개별 상품 삭제
    const handleDelete = async (itemId) => {
        try {
            await api.delete(`${api.defaults.baseURL}/cart/delete/${itemId}`);
            alert('상품이 삭제되었습니다.');
            fetchCartData(); // 삭제 후 데이터 새로고침
        } catch (error) {
            console.error("상품 삭제 중 오류 발생:", error);
            alert('상품 삭제에 실패했습니다.');
        }
    };

    // 선택된 상품들 일괄 삭제
    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) {
            alert('삭제할 상품을 선택해주세요.');
            return;
        }

        try {
            await api.post(`${api.defaults.baseURL}/cart/deletePickAll`, { cartIds: selectedItems });
            alert('선택된 상품들이 삭제되었습니다.');
            setSelectedItems([]); // 선택 상태 초기화
            setIsAllSelected(false);
            fetchCartData(); // 삭제 후 데이터 새로고침
        } catch (error) {
            console.error("선택 상품 삭제 중 오류 발생:", error);
            alert('선택 상품 삭제에 실패했습니다.');
        }
    };

    // cartList가 변경될 때마다 전체 선택 체크박스 상태 업데이트
    useEffect(() => {
        if (cartList.length === 0) {
            // 상태가 이미 false라면 setState를 호출하지 않음
            if (isAllSelected !== false) {
                setIsAllSelected(false);
            }
            if (selectedItems.length !== 0) {
                setSelectedItems([]);
            }
        } else {
            // 모든 상품이 선택되었는지 확인
            const allChecked = cartList.length > 0 && selectedItems.length === cartList.length;

            // 현재 상태와 다를 때만 업데이트
            if (isAllSelected !== allChecked) {
                setIsAllSelected(allChecked);
            }
        }
    }, [cartList, selectedItems, isAllSelected]); // isAllSelected도 의존성 배열에 추가


    return {
        selectedItems,
        isAllSelected,
        handleCheckboxChange,
        handleSelectAll,
        handleDelete,
        handleDeleteSelected,
    };
};

export default useCartSelection;
