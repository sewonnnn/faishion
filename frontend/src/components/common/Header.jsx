import React, { useState } from 'react';
import {
    Navbar,
    Container,
    Nav,
    Form,
    FormControl,
    Button,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';

// 카테고리 데이터
const categories = {
    여성: {
        의류: ['아우터', '원피스', '블라우스', '셔츠', '티셔츠', '니트', '스커트', '팬츠', '데님', '라운지웨어', '언더웨어'],
        가방: ['숄더백', '에코/캔버스백', '크로스백', '토트백', '클러치', '백팩', '지갑', '백팩 액세서리', '기타가방'],
        신발: ['스니커즈', '로퍼', '플랫슈즈', '펌프스', '샌들', '뮬/슬리퍼', '부츠', '시즌슈즈', '슈즈액세서리']
    },
    남성: {
        의류: ['아우터', '상의', '니트', '팬츠', '데님', '라운지웨어'],
        가방: ['백팩', '숄더백', '크로스백', '토트백', '클러치', '지갑', '백팩액세서리', '기타가방'],
        신발: ['스니커즈', '샌들', '슬리퍼', '부츠', '시즌슈즈', '레이스업']
    }
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 드롭다운 메뉴 렌더링 함수
    const renderSubCategories = (categoryData) => {
        return (
            <div className="row">
                {Object.keys(categoryData).map((subCategory, index) => (
                    <div className="col" key={index}>
                        <h6 className="dropdown-title">{subCategory}</h6>
                        <ul className="list-unstyled">
                            {categoryData[subCategory].map((item, subIndex) => (
                                <li key={subIndex}>
                                    <a href="#">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    // 전체 메뉴 렌더링 함수
    const renderAllMenu = () => {
        return (
            <div className="row g-0 full-menu">
                {Object.keys(categories).map(category => (
                    <div className="col-2 category-col" key={category}>
                        <h5 className="category-title">{category}</h5>
                        {renderSubCategories(categories[category])}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Navbar expand="lg" className="top-nav">
                <Container fluid>
                    {/* 상단 로고와 아이콘 */}
                    <Navbar.Brand href="/">
                        <h1 className="logo">fAIshion</h1>
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Nav.Link href="#wishlist"><i className="bi bi-heart"></i></Nav.Link>
                        <Nav.Link href="#user"><i className="bi bi-person"></i></Nav.Link>
                        <Nav.Link href="#cart"><i className="bi bi-bag"></i></Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <hr className="header-divider" />

            <div
                className="main-header-wrapper"
                onMouseOver={(e) => {
                    // 메인 내비게이션 링크에만 마우스 오버 시 메뉴를 엽니다.
                    if (e.target.closest('.main-nav-links .nav-link')) {
                        setIsMenuOpen(true);
                    }
                }}
                onMouseOut={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsMenuOpen(false);
                    }
                }}
            >
                <Navbar expand="lg">
                    <Container fluid>
                        {/* 메인 내비게이션 링크에 새로운 클래스 적용 */}
                        <Nav className="main-nav-links me-auto">
                            <Nav.Link href="#best">베스트</Nav.Link>
                            <Nav.Link href="#sale">세일</Nav.Link>
                            <Nav.Link href="#new">신상품</Nav.Link>
                            <Nav.Link href="#solo">단독</Nav.Link>
                            <Nav.Link href="#recom">추천</Nav.Link>
                            <Nav.Link href="/product/list?type=women">여성</Nav.Link>
                            <Nav.Link href="/product/list?type=women">남성</Nav.Link>
                        </Nav>
                        <div className={"user-info"}>
                            <Nav className="user-nav me-auto">
                                <Nav.Link href="/login">로그인</Nav.Link>
                                <Nav.Link href="#men">로그아웃</Nav.Link>
                                <Nav.Link href="/wishlist">관심상품</Nav.Link>
                                <Nav.Link href="/cart">장바구니</Nav.Link>
                                <Nav.Link href="/mypage">마이페이지</Nav.Link>
                            </Nav>
                            <Form className="d-flex search-bar">
                                <FormControl
                                    type="search"
                                    placeholder="상품을 검색하세요"
                                    aria-label="Search"
                                />
                                <Button variant="outline-success">
                                    <i className="bi bi-search"></i>
                                </Button>
                            </Form>
                        </div>
                    </Container>
                </Navbar>
                {isMenuOpen && (
                    <div
                        className="full-screen-dropdown"
                    >
                        {renderAllMenu()}
                    </div>
                )}
            </div>
        </>
    );
};

export default Header;