import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";
const AdminHeader = () => {

    const { logout } = useAuth();

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                <a className="navbar-brand" href="/seller">
                    관리자 센터
                </a>
                <Navbar.Toggle aria-controls="seller-navbar" />
                <Navbar.Collapse id="seller-navbar">
                    <Nav className="me-auto">
                        <a className="nav-link" href="/seller/qna/list">
                            문의 관리
                        </a>

                        <a className="nav-link" href="/seller/category">
                            카테고리 관리
                        </a>

                        <NavDropdown title="상품 관리" id="product-dropdown">
                            <a className="dropdown-item" href="/seller/product/list">
                                상품 목록
                            </a>
                            <a className="dropdown-item" href="/seller/product/new">
                                상품 등록
                            </a>
                        </NavDropdown>
                    </Nav>

                    <Nav>
                        <a className="nav-link" onClick={logout}>
                            로그아웃
                        </a>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default AdminHeader;