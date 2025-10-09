import React, { useState, useEffect } from 'react';
import {
    Navbar,
    Container,
    Nav,
    Form,
    FormControl,
    Button,
} from 'react-bootstrap';
import './Header.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate, Link } from 'react-router-dom'; // Link 추가
import { useAuth } from '../../contexts/AuthContext';


const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const { user, login, logout, api } = useAuth();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // api 사용 시, categoryList 대신 categories를 사용하도록 가정하고 수정
                const response = await api.get('/category/groups');
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                // 에러 발생 시 초기 데이터를 사용하거나 다른 처리를 할 수 있습니다.
            }
        };
        fetchCategories();
    }, [api]);

    // 카테고리 클릭 핸들러: useNavigate 사용
    const handleCategoryClick = (id) => {
        navigate(`/product/list?categoryId=${id}`);
        setIsMenuOpen(false); // 메뉴 닫기
    };

    // 하위 카테고리 렌더링
    const renderSubCategories = (subCategories) => {
        return (
            <div className="row">
                <div className="col">
                    <ul className="list-unstyled">
                        {subCategories.map((item) => {
                            return (
                                <li key={item.id}>
                                    {/* 📌 수정: <Link> 컴포넌트로 변경 */}
                                    <Link
                                        to={`/product/list?categoryId=${item.id}`}
                                        onClick={() => {
                                            handleCategoryClick(item.id);
                                        }}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    };

    // 전체 메뉴 렌더링 함수
    const renderAllMenu = () => {
        return (
            <div className="row g-0 full-menu">
                {categories.map(group => (
                    <div className="col-2 category-col" key={group.id}>
                        <h5 className="category-title">{group.name}</h5>
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


    const [selectedRole, setSelectedRole] = useState('USER');
    const createTempToken = async () => {
        try {
            const response = await api.post('/auth/temp/token',
                {
                    id : "asdf",
                    role : selectedRole
                }
            );
            login(response.data);
            alert('토큰이 성공적으로 발급되었습니다!');
        } catch (error) {
            console.error('토큰 발급 실패:', error);
            alert('토큰 발급에 실패했습니다.');
        }
    };

    return (
        <>
            <Navbar className="top-nav">
                <Container fluid>
                    {/* 📌 수정: Navbar.Brand의 href 대신 <Link>와 useNavigate 사용 */}
                    <Navbar.Brand
                        as={Link}
                        to="/"
                    >
                        <h1 className="logo">fAIshion</h1>
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        {user ? (
                            <>
                                <Nav.Link onClick={logout} style={{ cursor: 'pointer' }}>logout</Nav.Link>
                                {/* 📌 수정: Nav.Link의 href 대신 as={Link}와 to 사용 */}
                                <Nav.Link as={Link} to="/wishlist"><i className="bi bi-heart"></i></Nav.Link>
                                <Nav.Link as={Link} to="/mypage"><i className="bi bi-person"></i></Nav.Link>
                                <Nav.Link as={Link} to="/cart"><i className="bi bi-bag"></i></Nav.Link>
                            </>
                        ) : (
                            <>
                                {/* 📌 수정: Nav.Link의 href 대신 as={Link}와 to 사용 */}
                                <Nav.Link as={Link} to="/login">login</Nav.Link>
                            </>
                        )}
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
                <Container fluid className="main-header-content">
                    <Nav className="main-nav-links">
                        {/* 📌 수정: Nav.Link의 href 대신 as={Link}와 to 사용 */}
                        <Nav.Link as={Link} to="/product/list?type=best">베스트</Nav.Link>
                        <Nav.Link as={Link} to="/product/list?type=sale">세일</Nav.Link>
                        <Nav.Link as={Link} to="/product/list?type=new">신상품</Nav.Link>
                        <Nav.Link as={Link} to="/product/list?type=pick">추천</Nav.Link>
                        <Nav.Link as={Link} to="/product/list?type=common">공용</Nav.Link>
                        <Nav.Link as={Link} to="/product/list?type=man">남성</Nav.Link>
                        <Nav.Link as={Link} to="/product/list?type=woman">여성</Nav.Link>
                    </Nav>

                    {/* 2. 검색창: 모바일에서 별도의 줄로 내려가도록 CSS 조정 */}
                    <div className={"user-info search-bar-wrapper"}>
                        <Form className="d-flex search-bar" onSubmit={handleSearch}>
                            <FormControl
                                type="search"
                                placeholder="상품을 검색하세요"
                                aria-label="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button type="submit">
                                <i className="bi bi-search"></i>
                            </Button>
                        </Form>
                    </div>
                    {isMenuOpen && (
                        <div
                            className="full-screen-dropdown w-100"
                        >
                            {renderAllMenu()}
                        </div>
                    )}
                </Container>

            </div>
        </>
    );
};

export default Header;