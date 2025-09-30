import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";  // ← 빠졌던 useLocation 추가
import axios from "axios";
import { Tabs, Tab } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
    const nav = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [key, setKey] = useState("user"); // 'user' | 'seller'
    const [form, setForm] = useState({ loginId: "", password: "", id: "" });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    // RegisterPage → 로그인 리다이렉트 시 alert 띄우기
    useEffect(() => {
        if (location.state?.message) {
            alert(location.state.message);
            // alert 한 번만 뜨게 state 초기화
            nav(location.pathname, { replace: true, state: {} });
        }
    }, [location, nav]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (key === "user" && (!form.loginId || !form.password)) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }
        if (key === "seller" && (!form.id || !form.password)) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        setLoading(true);
        const url =
            key === "seller"
                ? "http://localhost:8080/auth/seller/login"
                : "http://localhost:8080/auth/login";

        try {
            const res = await axios.post(url, form, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            login(res.data.accessToken);
            alert("로그인 성공!");
            nav("/");
        } catch (err) {
            console.log(err);
            alert(err?.response?.data || "로그인 실패");
        } finally {
            setLoading(false);
        }
    };

    // 네이버 로그인 핸들러
    const handleNaverLogin = () => {
        const naverClientId = "UbIrUTt9yAJ42TARcJC5";
        const naverRedirectUri = encodeURIComponent(
            "http://localhost:5173/oauthcallback/naver"
        );
        const state = Math.random().toString(36).substring(2);

        const socialAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${naverRedirectUri}&state=${state}`;
        window.location.href = socialAuthUrl;
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 420 }}>
            <h2 className="mb-4 text-center">로그인</h2>

            <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
                {/* 일반회원 로그인 */}
                <Tab eventKey="user" title="일반회원 로그인">
                    <form onSubmit={onSubmit} className="mb-4">
                        <div className="mb-3">
                            <label className="form-label">아이디</label>
                            <input
                                className="form-control"
                                name="loginId"
                                value={form.loginId}
                                onChange={onChange}
                                placeholder="아이디 입력"
                                autoComplete="username"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">비밀번호</label>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <input
                                    type={showPw ? "text" : "password"}
                                    className="form-control"
                                    name="password"
                                    value={form.password}
                                    onChange={onChange}
                                    placeholder="비밀번호"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        marginLeft: "-35px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {showPw ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        <button className="btn btn-primary w-100 mb-2" disabled={loading}>
                            {loading ? "로그인 중..." : "로그인하기"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100"
                            onClick={() => nav("/register")}
                        >
                            회원가입 하기
                        </button>
                    </form>

                    {/* 네이버 로그인 버튼 */}
                    <hr />
                    <div className="d-grid gap-2">
                        <button
                            className="btn btn-naverlogin"
                            onClick={handleNaverLogin}
                        >
                            네이버로 로그인
                        </button>
                    </div>
                </Tab>

                {/* 판매자 로그인 */}
                <Tab eventKey="seller" title="판매자 로그인">
                    <form onSubmit={onSubmit}>
                        <div className="mb-3">
                            <label className="form-label">아이디</label>
                            <input
                                className="form-control"
                                name="id"
                                value={form.id}
                                onChange={onChange}
                                placeholder="아이디 입력"
                                autoComplete="username"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">비밀번호</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={form.password}
                                onChange={onChange}
                                placeholder="비밀번호"
                                autoComplete="current-password"
                            />
                        </div>
                        <button className="btn btn-primary w-100 mb-2" disabled={loading}>
                            {loading ? "로그인 중..." : "로그인하기"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100"
                            onClick={() => nav("/seller/register")}
                        >
                            회원가입 하기
                        </button>
                    </form>
                </Tab>
            </Tabs>
        </div>
    );
};

export default LoginPage;
