import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tabs, Tab } from "react-bootstrap";

const LoginPage = () => {
    const nav = useNavigate();
    const [key, setKey] = useState("user"); // 'user' | 'seller'
    const [form, setForm] = useState({ id: "", password: "" });
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.id || !form.password) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }
        setLoading(true);

        const url =
            key === "seller"
                ? "http://localhost:8080/seller/login"
                : "http://localhost:8080/auth/login";

        try {
            const res = await axios.post(url, form, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            alert("로그인 성공!");
            nav("/");
        } catch (err) {
            alert(err?.response?.data || "로그인 실패");
        } finally {
            setLoading(false);
        }
    };

    // 소셜 로그인 핸들러 (일반회원만 사용)
    const handleSocialLogin = (provider) => {
        let socialAuthUrl = "";

        if (provider === "naver") {
            const naverClientId = "UbIrUTt9yAJ42TARcJC5";
            const naverRedirectUri = encodeURIComponent(
                "http://localhost:5173/oauthcallback?provider=naver"
            );
            socialAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${naverRedirectUri}&state=${Math.random()
                .toString(36)
                .substring(2)}`;
        } else if (provider === "kakao") {
            const kakaoClientId = "YOUR_KAKAO_CLIENT_ID";
            const kakaoRedirectUri = encodeURIComponent(
                "http://localhost:5173/oauthcallback?provider=kakao"
            );
            socialAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${kakaoRedirectUri}&response_type=code&scope=profile_nickname,account_email,phone_number`;
        } else {
            alert("지원하지 않는 소셜 로그인 제공자입니다.");
            return;
        }

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
                            onClick={() => nav("/register")}
                        >
                            회원가입 하기
                        </button>
                    </form>

                    {/* 소셜 로그인 버튼 (일반회원 전용) */}
                    <hr />
                    <div className="d-grid gap-2">
                        <button
                            className="btn btn-naverlogin"
                            onClick={() => handleSocialLogin("naver")}
                        >
                            네이버로 로그인
                        </button>
                        <button
                            className="btn btn-kakaologin"
                            onClick={() => handleSocialLogin("kakao")}
                        >
                            카카오로 로그인
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
