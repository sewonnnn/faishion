import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function LoginSuccessPage() {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();

    const code = searchParams.get("code");
    const state = searchParams.get("state"); // 네이버만 필요
    const provider = searchParams.get("provider"); // 👈 callback URL에서 provider 추출

    useEffect(() => {
        if (!code || !provider) {
            alert("인가 코드 또는 provider 정보가 없습니다. 다시 로그인해주세요.");
            nav("/login");
            return;
        }

        const sendAuthCodeToBackend = async () => {
            try {
                let url = "";
                let body = { code };

                if (provider === "naver") {
                    url = "http://localhost:8080/auth/login/naver";
                    body.state = state;
                } else if (provider === "kakao") {
                    url = "http://localhost:8080/auth/login/kakao";
                } else {
                    alert("지원하지 않는 로그인 제공자입니다.");
                    nav("/login");
                    return;
                }

                const response = await axios.post(url, body, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true, // 쿠키 받기
                });

                alert(`${provider} 로그인 성공! ` +  response.data);
                nav("/");
            } catch (error) {
                console.error("소셜 로그인 처리 중 오류:", error);
                alert(error?.response?.data || "소셜 로그인 실패");
                nav("/login");
            }
        };

        sendAuthCodeToBackend();
    }, [code, state, provider, nav]);

    return <div>소셜 로그인 처리 중...</div>;
}
