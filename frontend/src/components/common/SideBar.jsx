import React, { useState } from 'react';
import { Nav, Button, Container, Navbar, Offcanvas } from 'react-bootstrap';
import './SideBar.css';
import { NavLink } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext.jsx";

const SideBar = ({ menuItems = [] }) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const { logout } = useAuth();

    // 메뉴와 로그아웃 버튼을 렌더링하는 공통 컴포넌트
    const MenuContent = () => (
        <>
            <Nav
                className="flex-column flex-nowrap flex-grow-1 sidebar-nav-scroll"
                onClick={handleClose} // 메뉴 클릭 시 모바일 메뉴 닫기
            >
                {menuItems.map((item) => (
                    <NavLink to={item.href} key={item.href} className="nav-link-style" end>
                        {/* 아이콘이 있다면 여기에 <Icon /> 추가 */}
                        {item.name}
                    </NavLink>
                ))}
            </Nav>

            <div className="p-3 sidebar-footer">
                <Button className="w-100 logout-btn" onClick={logout}>
                    로그아웃
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* 1. 데스크탑 사이드바 (md 이상) */}
            <Container
                fluid
                className="sidebar-container d-none d-md-flex flex-column vh-100 p-0 position-sticky top-0"
            >
                <div className="p-3 text-center ">
                    <h2 className="mb-0 text-white">fAIshion</h2>
                </div>
                <MenuContent />
            </Container>

            {/* 2. 모바일 헤더 (md 미만) */}
            <Navbar bg="dark" variant="dark" sticky="top" className="d-md-none w-100">
                <Container fluid>
                    <Button variant="link" onClick={handleShow} className="p-0">
                        <span className="navbar-toggler-icon"></span>
                    </Button>
                    <Navbar.Brand href="#" className="mx-auto">fAIshion</Navbar.Brand>
                </Container>
            </Navbar>

            {/* Offcanvas (모바일 메뉴 본체) */}
            <Offcanvas show={show} onHide={handleClose} placement="start" className="offcanvas-sidebar">
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>fAIshion</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column p-0">
                    <MenuContent />
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default SideBar;