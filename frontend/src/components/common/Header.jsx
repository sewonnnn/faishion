import { useState } from "react"; // useState 훅 추가
import './Header.css';

const Header = () => {
    // 각 메뉴 항목의 펼침 상태를 관리하는 state
    const [isOpen, setIsOpen] = useState({
        login: false,
        adminPage: false,
        product: false,
        customer: false,
        seller: false
    });

    // 마우스가 메뉴 항목에 들어왔을 때 호출되는 함수
    const handleMouseEnter = (menu) => {
        setIsOpen(prev => ({ ...prev, [menu]: true }));
    };

    // 마우스가 메뉴 항목에서 나갔을 때 호출되는 함수
    const handleMouseLeave = (menu) => {
        setIsOpen(prev => ({ ...prev, [menu]: false }));
    };

    return (
        <div className={"Header_Container"}>
            <ul className={"Header_List"}>
                <li className={"Header_Item"} onMouseEnter={() => handleMouseEnter('login')} onMouseLeave={() => handleMouseLeave('login')}>
                    <a href={"/login"}>로그인 페이지</a>
                    {/* isOpen.aiFitting이 true일 때만 서브 메뉴 표시 */}
                    {isOpen.login && (
                        <ul className="SubMenu">
                            <li><a href={"/register"}>회원가입</a></li>
                            <li><a href={"/"}>홈페이지</a></li>
                        </ul>
                    )}
                </li>
                <li className={"Header_Item"} onMouseEnter={() => handleMouseEnter('product')} onMouseLeave={() => handleMouseLeave('product')}>
                    <a href={"/product/list"}>상품조회 페이지</a>
                    {/* isOpen.aiFitting이 true일 때만 서브 메뉴 표시 */}
                    {isOpen.product && (
                        <ul className="SubMenu">
                            <li><a href={"/product/:productId"}>상품상세</a></li>
                        </ul>
                    )}
                </li>
                <li className={"Header_Item"} onMouseEnter={() => handleMouseEnter('customer')} onMouseLeave={() => handleMouseLeave('customer')}>
                    <a href={"/mypage"}>구매자 페이지</a>
                    {/* isOpen.aiFitting이 true일 때만 서브 메뉴 표시 */}
                    {isOpen.customer && (
                        <ul className="SubMenu">
                            <li><a href={"/cart"}>장바구니</a></li>
                            <li><a href={"/wishlist"}>찜 목록</a></li>
                            <li><a href={"/order/new"}>주문/결제 폼</a></li>
                            <li><a href={"/order/complete"}>주문완료</a></li>
                            <li><a href={"/order/:orderId"}>주문상세</a></li>
                        </ul>
                    )}
                </li>
                <li className={"Header_Item"} onMouseEnter={() => handleMouseEnter('seller')} onMouseLeave={() => handleMouseLeave('seller')}>
                    <a href={"/seller"}>판매자 페이지</a>
                    {/* isOpen.aiFitting이 true일 때만 서브 메뉴 표시 */}
                    {isOpen.seller && (
                        <ul className="SubMenu">
                            <li><a href={"/seller/product/list"}>상품 목록</a></li>
                            <li><a href={"/seller/product/:productId"}>상품 상세조회</a></li>
                            <li><a href={"/seller/product/new"}>상품 등록 폼</a></li>
                            <li><a href={"/seller/product/edit/:productId"}>상품 편집</a></li>
                        </ul>
                    )}
                </li>
                <li className={"Header_Item"} onMouseEnter={() => handleMouseEnter('adminPage')} onMouseLeave={() => handleMouseLeave('adminPage')}>
                    <a href={"/admin"}>관리자 페이지</a>
                    {/* isOpen.adminPage가 true일 때만 서브 메뉴 표시 */}
                    {isOpen.adminPage && (
                        <ul className="SubMenu">
                            <li><a href={"/admin"}>대시보드</a></li>
                            <li><a href={"/admin/seller/list"}>사용자 관리</a></li>
                            <li><a href={"/admin/seller/:sellerId"}>설정</a></li>
                        </ul>
                    )}
                </li>
                <li className={"Header_Item"} onMouseEnter={() => handleMouseEnter('adminPage')} onMouseLeave={() => handleMouseLeave('adminPage')}>
                    <a href={"/admin"}>햄버거 버튼</a>
                    {/* isOpen.adminPage가 true일 때만 서브 메뉴 표시 */}
                    {isOpen.adminPage && (
                        <table className="SubMenu">
                            <tr>
                                <td><a href={"/admin"}>대시보드</a></td>
                                <td><a href={"/admin"}>대시보드</a></td>
                                <td><a href={"/admin"}>대시보드</a></td>
                            </tr>
                            <tr>
                                <td><a href={"/admin/seller/list"}>사용자 관리</a></td>
                                <td><a href={"/admin/seller/list"}>사용자 관리</a></td>
                                <td><a href={"/admin/seller/list"}>사용자 관리</a></td>
                            </tr>
                            <tr>
                                <td><a href={"/admin/seller/list"}>사용자 관리</a></td>
                                <td><a href={"/admin/seller/list"}>사용자 관리</a></td>
                                <td><a href={"/admin/seller/list"}>사용자 관리</a></td>
                            </tr>
                        </table>
                    )}
                </li>
            </ul>
        </div>
    );
}

export default Header;