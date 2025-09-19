import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
    const nav = useNavigate();
    const [form, setForm] = useState({ login: "", password: "" });
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.login || !form.password) {
            alert("아이디(또는 이메일)와 비밀번호를 입력해주세요.");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8080/auth/login", form, {
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

    // 👇️ 소셜 로그인 핸들러 수정
    const handleSocialLogin = (provider) => {
        let socialAuthUrl = "";

        if (provider === 'naver') {
            // 네이버 개발자 센터에서 발급받은 클라이언트 아이디
            const naverClientId =  'UbIrUTt9yAJ42TARcJC5';
            // 네이버 개발자 센터에 등록한 콜백 URL (프론트엔드 라우트)
            const naverRedirectUri = encodeURIComponent('http://localhost:5173/oauthcallback');
            // 네이버 인가 요청 URL (scope는 필요한 정보에 따라 추가)
            socialAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${naverRedirectUri}&state=${Math.random().toString(36).substring(2)}`;
            // state 값은 CSRF 공격 방지를 위해 사용하며, 서버에서 검증해야 합니다. 여기서는 간단히 랜덤 값 사용.
        } else if (provider === 'kakao') {
            // 카카오 개발자 센터에서 발급받은 클라이언트 아이디
            const kakaoClientId = 'YOUR_KAKAO_CLIENT_ID';
            // 카카오 개발자 센터에 등록한 콜백 URL (프론트엔드 라우트)
            const kakaoRedirectUri = encodeURIComponent('http://localhost:5173/oauthcallback');
            // 카카오 인가 요청 URL (scope는 필요한 정보에 따라 추가)
            socialAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${kakaoRedirectUri}&response_type=code&scope=profile_nickname,account_email,phone_number`;
        } else {
            alert("지원하지 않는 소셜 로그인 제공자입니다.");
            return;
        }

        // 구성된 URL로 리디렉션
        window.location.href = socialAuthUrl;
    };

    return (
        <>
            <h1 className="mb-3">LoginPage</h1>

            {/* 로컬 로그인 폼 */}
            <form onSubmit={onSubmit} className="mb-4" style={{ maxWidth: 420 }}>
                <div className="mb-3">
                    <label className="form-label">아이디 또는 이메일</label>
                    <input
                        className="form-control"
                        name="login"
                        value={form.login}
                        onChange={onChange}
                        placeholder="아이디 또는 이메일을 입력"
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
                <button className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "로그인 중..." : "로그인"}
                </button>
            </form>

            {/* 소셜 로그인 */}
            <div style={{ maxWidth: 420 }}>
                <div className="d-grid gap-2">
                    {/* 👇️ onClick 이벤트 핸들러로 변경 */}
                    <button
                        className="btn btn-naverlogin"
                        onClick={() => handleSocialLogin('naver')}
                    >
                        네이버로 로그인
                    </button>
                    <button
                        className="btn btn-kakaologin"
                        onClick={() => handleSocialLogin('kakao')}
                    >
                        카카오로 로그인
                    </button>
                </div>
            </div>
        </>
    );
};

export default LoginPage;