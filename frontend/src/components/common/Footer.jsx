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
                                    <span className="cc-link disabled-link" aria-disabled="true" role="text">1644-0000</span>
                                    <span className="cc-time">평일 10:00–17:00 (점심 12:40–13:50)</span>
                                </div>
                                <div className="cc-line">
                                    <FaEnvelope aria-hidden="true" />
                                    <span className="cc-link disabled-link" aria-disabled="true" role="text">help@faishion.co.kr</span>
                                </div>
                                <div className="cc-line">
                                    <FaMapMarkerAlt aria-hidden="true" />
                                    <span>서울특별시 관악구 봉천로 227, 5F</span>
                                </div>
                            </div>

                            {/* 소셜 링크 비활성화 */}
                            <div className="footer-social">
                                <span className="social disabled-link" aria-disabled="true" role="img" aria-label="Instagram"><FaInstagram /></span>
                                <span className="social disabled-link" aria-disabled="true" role="img" aria-label="Facebook"><FaFacebookF /></span>
                                <span className="social disabled-link" aria-disabled="true" role="img" aria-label="YouTube"><FaYoutube /></span>
                            </div>
                        </Col>

                        {/* 빠른 메뉴 */}
                        <Col lg={2} md={6}>
                            <h6 className="footer-title">빠른메뉴</h6>
                            <ul className="footer-list">
                                <li><a href="/notice/list">공지사항</a></li>
                                <li><a href="/qna/list">Q&A</a></li>
                                {/* 아래 3개 비활성화 */}
                                <li><span className="disabled-link" aria-disabled="true" role="text">주문/배송조회</span></li>
                                <li><span className="disabled-link" aria-disabled="true" role="text">교환/반품 안내</span></li>
                                <li><span className="disabled-link" aria-disabled="true" role="text">판매자 입점문의</span></li>
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
                                {/* 에스크로 확인 비활성화 */}
                                <span className="escrow-link disabled-link" aria-disabled="true" role="text"> 에스크로 확인</span>
                            </div>
                        </Col>

                        {/* 회사 정보(법정표기) */}
                        <Col lg={3} md={6}>
                            <h6 className="footer-title">회사 정보</h6>
                            <ul className="footer-info">
                                <li><strong>대표자명</strong> : 권택준 · 박세원 · 이현호</li>
                                <li>
                                    <strong>사업자등록번호</strong> : 211-88-00000
                                    <span className="lookup disabled-link" aria-disabled="true" role="text">사업자정보확인</span>
                                </li>
                                <li><strong>통신판매업신고</strong> : 제20241010호</li>
                                <li><strong>개인정보보호책임자</strong> : 유부미</li>
                            </ul>

                            <div className="policy-links">
                                {/* 개인정보처리방침 포함 비활성화로 변경 */}
                                <span className="disabled-link" aria-disabled="true" role="text">이용약관</span>
                                <span className="divider">|</span>
                                <span className="disabled-link emph" aria-disabled="true" role="text">개인정보처리방침</span>
                                <span className="divider">|</span>
                                <span className="disabled-link" aria-disabled="true" role="text">이용안내</span>
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
