import React, { useState } from 'react';
import { Nav, Button, Container, Navbar, Offcanvas, Form } from 'react-bootstrap';
import './SideBar.css';
import { NavLink } from 'react-router-dom';

const SideBar = ({ menuItems = [] }) => {

    // Offcanvas (햄버거 메뉴) 상태 관리
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleLogout = () => {
        console.log('로그아웃 실행');
        // 실제 로그아웃 로직 (예: API 호출, 토큰 삭제 등)
        handleClose();
    };

    // 메뉴와 로그아웃 버튼을 렌더링하는 함수 (반복 사용)
    const MenuContent = () => (
        <>

            {/* 네비게이션 섹션 */}
            <Nav
                defaultActiveKey={menuItems.length > 0 ? menuItems[0].href : ""}
                className="flex-column flex-grow-1 sidebar-nav-scroll px-3 py-2"
                onClick={handleClose} // 메뉴 클릭 시 Offcanvas 닫기
            >
                {/* 섹션 구분선 */}
                <div className="sidebar-section-title">판매자 대시보드</div>

                {menuItems.map((item, index) => (
                    // 이미지 스타일에 맞게 NavLink 내부에 아이콘 추가
                    <NavLink to={item.href} key={item.href} className="nav-link-style" end>
                        {item.name}
                    </NavLink>
                ))}

            </Nav>

            <div className="p-3 sidebar-footer">
                <Button
                    variant="primary"
                    className="w-100 sidebar-logout-btn" // 커스텀 클래스 추가
                    onClick={handleLogout}
                >
                    로그아웃
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* 1. 데스크탑 사이드바 (md 이상에서 보임) */}
            <Container
                fluid
                className="sidebar-container d-none d-md-flex flex-column vh-100 p-0"
            >
                <div className="p-3 text-center sidebar-logo-area">
                    <h2 className="mb-0 text-white sidebar-logo">fAIshion</h2>
                </div>
                {MenuContent()}
            </Container>

            {/* 2. 모바일 헤더 + 햄버거 메뉴 (md 미만에서 보임) */}
            <Navbar
                bg="dark"
                variant="dark"
                sticky="top"
                className="d-md-none w-100 mobile-navbar" // md 미만에서 보임
            >
                <Container fluid>
                    <Button variant="link" onClick={handleShow} className="menu-toggle-btn">
                        <span className="navbar-toggler-icon"></span>
                    </Button>
                    <Navbar.Brand href="#" className="mobile-logo">fAIshion</Navbar.Brand>
                    {/* 검색 버튼 등 기타 요소가 올 수 있습니다. */}
                    <div className="search-placeholder"></div>
                </Container>
            </Navbar>

            {/* Offcanvas (햄버거 메뉴 본체) */}
            <Offcanvas show={show} onHide={handleClose} placement="start" className="offcanvas-sidebar">
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title className="mobile-logo">fAIshion</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column p-0">
                    {MenuContent()}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default SideBar;