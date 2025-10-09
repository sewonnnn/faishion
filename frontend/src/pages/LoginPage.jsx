import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
    const nav = useNavigate();
    const location = useLocation();
    const { login, api } = useAuth();
    const [key, setKey] = useState("user");
    const [form, setForm] = useState({ loginId: "", password: "", id: "" });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [isNaver, setIsNaver] = useState(false);
    useEffect(() => {
        if (location.state?.message) {
            alert(location.state.message);
            nav(location.pathname, { replace: true, state: {} });
        }
    }, [location, nav]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if(isNaver){
            return
            }
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
                ? "/auth/seller/login"
                : "/auth/login";

        try {
            const res = await api.post(url, form, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            key === "seller" ? login(res.data.accessToken) : login(res.data);
            alert("로그인 성공!");
            nav("/");
        } catch (err) {
            console.log(err);
            alert(err?.response?.data || "로그인 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleNaverLogin = () => {
        const naverClientId = "UbIrUTt9yAJ42TARcJC5";
        const naverRedirectUri = encodeURIComponent(
            `${window.location.origin}/oauthcallback/naver`
        );
        const state = Math.random().toString(36).substring(2);

        const socialAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${naverRedirectUri}&state=${state}`;
        window.location.href = socialAuthUrl;
        setIsNaver(true);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 420 }}>
            <h2 className="mb-4 text-center">LOGIN</h2>

            {/* 탭 → 폭 맞추고 반반 배치 */}
            <Tabs
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-3 nav-fill"
                justify
            >
                {/* 일반회원 로그인 */}
                <Tab eventKey="user" title="일반회원">
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
                            <div className="position-relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    className="form-control pe-5"
                                    name="password"
                                    value={form.password}
                                    onChange={onChange}
                                    placeholder="비밀번호"
                                    autoComplete="current-password"
                                />
                                <span
                                    onClick={() => setShowPw(!showPw)}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer",
                                        color: "#888",
                                    }}
                                >
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </span>
                            </div>
                        </div>
                        <button className="btn btn-primary w-100 mb-2" disabled={loading}>
                            {loading ? "로그인 중..." : "로그인하기"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100 my-0"
                            onClick={() => nav("/register")}
                        >
                            회원가입 하기
                        </button>

                        {/* SNS 로그인 구분선 */}
                        <div className="d-flex align-items-center my-2">
                            <hr className="flex-grow-1" />
                            <span className="mx-2 text-muted">SNS 계정으로 로그인</span>
                            <hr className="flex-grow-1" />
                        </div>
                        {/* 네이버 로그인 버튼 */}
                        {/*<hr />*/}
                        <div className="d-grid gap-1">
                            <button
                                className="btn  mb-5"
                                style={{
                                    backgroundColor: "#03C75A",
                                    color: "white",
                                    fontWeight: "bold",
                                }}
                                onClick={handleNaverLogin}
                            >
                                <span style={{ marginRight: "6px" }}>N</span> 네이버로 로그인
                            </button>
                        </div>
                    </form>


                </Tab>

                {/* 판매자 로그인 */}
                <Tab eventKey="seller" title="판매자">
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
                            <div className="position-relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    className="form-control pe-5"
                                    name="password"
                                    value={form.password}
                                    onChange={onChange}
                                    placeholder="비밀번호"
                                    autoComplete="current-password"
                                />
                                <span
                                    onClick={() => setShowPw(!showPw)}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer",
                                        color: "#888",
                                    }}
                                >
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </span>
                            </div>
                        </div>
                        <button className="btn btn-primary w-100 mb-2" disabled={loading}>
                            {loading ? "로그인 중..." : "로그인하기"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100"
                            style={{ marginBottom: "225px" }}
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
