import React, { useState, useEffect } from 'react';
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
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import axios from "axios";


const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // 검색 입력창의 값을 관리하기 위한 상태
    const [searchQuery, setSearchQuery] = useState('');
    // API에서 가져올 카테고리 데이터를 위한 상태
    const [categories, setCategories] = useState([]);
    // URL 변경을 위한 navigate 훅 사용
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/category/groups');
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                // 에러 발생 시 초기 데이터를 사용하거나 다른 처리를 할 수 있습니다.
            }
        };

        fetchCategories();
    }, []);

    const renderSubCategories = (subCategories) => {
        return (
            <div className="row">
                <div className="col">
                    <ul className="list-unstyled">
                        {subCategories.map((item) => {
                            // url 생성 시 categoryName과 item.name을 사용합니다.
                            const url = `/product/list?categoryId=${item.id}`;
                            return (
                                <li key={item.id}>
                                    <a href={url}>{item.name}</a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    };

    // 전체 메뉴 렌더링 함수
    // categories 상태는 이제 CategoryGroupDTO 배열입니다.
    const renderAllMenu = () => {
        return (
            <div className="row g-0 full-menu">
                {categories.map(group => (
                    <div className="col-2 category-col" key={group.id}>
                        {/* group.name을 제목으로 사용합니다. */}
                        <h5 className="category-title">{group.name}</h5>
                        {/* group.categoryList를 하위 카테고리 데이터로 전달합니다. */}
                        {renderSubCategories(group.categories)}
                    </div>
                ))}
            </div>
        );
    };

    // 검색 핸들러 함수
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/product/list?searchQuery=${searchQuery.trim()}`);
            setSearchQuery('');
        }
    };

    return (
        <>
            <Navbar expand="lg" className="top-nav">
                <Container fluid>
                    <Navbar.Brand href="/">
                        <h1 className="logo">fAIshion</h1>
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Nav.Link href="/login">login</Nav.Link>
                        <Nav.Link href="/cart">logout</Nav.Link>
                        <Nav.Link href="/wishlist"><i className="bi bi-heart"></i></Nav.Link>
                        <Nav.Link href="/mypage"><i className="bi bi-person"></i></Nav.Link>
                        <Nav.Link href="/cart"><i className="bi bi-bag"></i></Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <hr className="header-divider" />

            <div
                className="main-header-wrapper"
                onMouseOver={(e) => {
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
                        <Nav className="main-nav-links me-auto">
                            <Nav.Link href="#best">베스트</Nav.Link>
                            <Nav.Link href="#sale">세일</Nav.Link>
                            <Nav.Link href="#new">신상품</Nav.Link>
                            <Nav.Link href="#solo">단독</Nav.Link>
                            <Nav.Link href="#recom">추천</Nav.Link>
                            <Nav.Link href="/product/list?type=women">여성</Nav.Link>
                            <Nav.Link href="/product/list?type=men">남성</Nav.Link>
                        </Nav>
                        <div className={"user-info"}>
                            <Form className="d-flex seantrch-bar" onSubmit={handleSearch}>
                                <FormControl
                                    type="search"
                                    placeholder="상품을 검색하세요"
                                    aria-label="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button variant="outline-success" type="submit">
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