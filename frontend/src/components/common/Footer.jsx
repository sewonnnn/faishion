import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer mt-auto">
            <div className="footer-top">
                <Container>
                    <Row className="gy-4">
                        {/* 브랜드 & 고객센터 */}
                        <Col lg={4} md={6}>
                            <h5 className="footer-brand">(주) fAIshion</h5>
                            <p className="footer-desc">
                                AI 기반 버추얼 트라이온 멀티 벤더 쇼핑몰 fAIshion 입니다.
                                편리하고 즐거운 쇼핑 경험을 제공하겠습니다.
                            </p>

                            <div className="footer-cc">
                                <div className="cc-line">
                                    <FaPhoneAlt aria-hidden="true" />
                                    <a href="tel:1644-0000" className="cc-link">1644-0000</a>
                                    <span className="cc-time">평일 10:00–17:00 (점심 12:40–13:50)</span>
                                </div>
                                <div className="cc-line">
                                    <FaEnvelope aria-hidden="true" />
                                    <a href="mailto:help@faishion.co.kr" className="cc-link">help@faishion.co.kr</a>
                                </div>
                                <div className="cc-line">
                                    <FaMapMarkerAlt aria-hidden="true" />
                                    <span>서울특별시 ○○구 ○○로 123, 5F</span>
                                </div>
                            </div>

                            <div className="footer-social">
                                <a href="#" aria-label="Instagram" className="social"><FaInstagram /></a>
                                <a href="#" aria-label="Facebook" className="social"><FaFacebookF /></a>
                                <a href="#" aria-label="YouTube" className="social"><FaYoutube /></a>
                            </div>
                        </Col>

                        {/* 빠른 메뉴 */}
                        <Col lg={2} md={6}>
                            <h6 className="footer-title">빠른메뉴</h6>
                            <ul className="footer-list">
                                <li><a href="/notice/list">공지사항</a></li>
                                <li><a href="/qna/list">Q&A</a></li>
                                <li><a href="/mypage/orders">주문/배송조회</a></li>
                                <li><a href="/cs/return">교환/반품 안내</a></li>
                                <li><a href="/seller/apply">판매자 입점문의</a></li>
                            </ul>
                        </Col>

                        {/* 결제/무통장 & 에스크로(예시) */}
                        <Col lg={3} md={6}>
                            <h6 className="footer-title">입금계좌 안내</h6>
                            <ul className="footer-list">
                                <li>국민 123456-01-000000 (㈜fAIshion)</li>
                                <li>신한 110-000-000000 (㈜fAIshion)</li>
                                <li>농협 302-0000-0000-00 (㈜fAIshion)</li>
                            </ul>
                            <div className="escrow-box" role="note" aria-label="에스크로 서비스 안내">
                                안전거래를 위해 현금 결제 시 구매안전(에스크로) 서비스를 이용하실 수 있습니다.
                                <a href="#" target="_blank" rel="noopener noreferrer" className="escrow-link"> 에스크로 확인</a>
                            </div>
                        </Col>

                        {/* 회사 정보(법정표기) */}
                        <Col lg={3} md={6}>
                            <h6 className="footer-title">회사 정보</h6>
                            <ul className="footer-info">
                                <li><strong>대표자명</strong> : 권택준 · 박세원 · 유부미 · 이현호</li>
                                <li><strong>사업자등록번호</strong> : 211-88-79575
                                    <a href="#" target="_blank" rel="noopener noreferrer" className="lookup"> 사업자정보확인</a>
                                </li>
                                <li><strong>통신판매업신고</strong> : 제20241010호</li>
                                <li><strong>개인정보보호책임자</strong> : 유부미</li>
                            </ul>

                            <div className="policy-links">
                                <a href="/policy/terms">이용약관</a>
                                <span className="divider">|</span>
                                <a href="/policy/privacy" className="emph">개인정보처리방침</a>
                                <span className="divider">|</span>
                                <a href="/policy/guide">이용안내</a>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* 하단 라인 */}
            <div className="footer-bottom">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6} className="small text-md-start text-center">
                            © {year} fAIshion Co., Ltd. All rights reserved.
                        </Col>
                        <Col md={6} className="small text-md-end text-center">
                            본 사이트의 모든 콘텐츠는 저작권의 보호를 받습니다.
                        </Col>
                    </Row>
                </Container>
            </div>
        </footer>
    );
};

export default Footer;
