import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";

const AdminHeader = () => {
    const { logout } = useAuth();

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                <a className="navbar-brand" href="/admin">
                    관리자 센터
                </a>
                <Navbar.Toggle aria-controls="admin-navbar" />
                <Navbar.Collapse id="admin-navbar">
                    <Nav className="me-auto">
                        <a className="nav-link" href="/admin">
                            대시보드
                        </a>
                        <a className="nav-link" href="/admin/notice/list">
                            공지사항 관리
                        </a>
                        <a className="nav-link" href="/admin/report/list">
                            신고 글 관리
                        </a>
                        <NavDropdown title="판매자 관리" id="seller-dropdown">
                            <a className="dropdown-item" href="/admin/seller/list">
                                판매자 목록
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