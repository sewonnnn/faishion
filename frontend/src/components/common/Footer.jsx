import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css'; // 필요하다면 추가적인 스타일을 위해 그대로 둡니다.

const Footer = () => {
    return (
        <footer className="bg-light text-center text-lg-start mt-auto">
            <Container className="p-4">
                <Row className="justify-content-between">
                    {/* 왼쪽 섹션: 공지사항, QnA */}
                    <Col lg={4} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase">고객센터</h5>
                        <ul className="list-unstyled mb-0">
                            <li>
                                <a href="/notice/list" className="text-dark">공지사항</a>
                            </li>
                            <li>
                                <a href="/qna/list" className="text-dark">QnA</a>
                            </li>
                        </ul>
                    </Col>

                    {/* 오른쪽 섹션: 회사 정보 */}
                    <Col lg={6} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase">(주) fAIshion</h5>
                        <div className="text-muted">
                            <p>대표자 명 : # | 주소 : # | 사업자등록번호 : 211-88-79575</p>
                            <p>통신판매업신고 : 제20241010</p>
                            <p>고객센터 : # | 이메일 : #</p>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* 저작권 정보 섹션 */}
            <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                © 2024 fAIshion. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;