import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

const SellerHeader = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                <a className="navbar-brand" href="/seller">
                    판매자 센터
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

                        <a className="nav-link" href="/seller/order/list">
                            주문 현황 관리
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
                        <NavDropdown title="내 계정" id="account-dropdown" align="end">
                            <a className="dropdown-item" href="#">
                                프로필
                            </a>
                            <NavDropdown.Divider />
                            <a className="dropdown-item" href="#">
                                로그아웃
                            </a>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default SellerHeader;
