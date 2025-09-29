import { useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import {useAuth} from "../contexts/AuthContext.jsx";

export default function LoginSuccessPage() {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { login } = useAuth();

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    useEffect(() => {
        if (!code) {
            alert("인가 코드가 없습니다. 다시 로그인해주세요.");
            nav("/login");
            return;
        }

        const sendAuthCodeToBackend = async () => {
            try {
                const url = "http://localhost:8080/auth/login/naver";
                const body = { code, state };

                const response = await axios.post(url, body, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });
                // 수정
                login(response.data.accessToken);
                alert(`네이버 로그인 성공! ${response.data.name} (${response.data.email})`);
                nav("/");
            } catch (error) {
                console.error("소셜 로그인 처리 중 오류:", error);
                alert(error?.response?.data || "소셜 로그인 실패");
                nav("/login");
            }
        };

        sendAuthCodeToBackend();
    }, [code, state, nav, location]);

    return <div>소셜 로그인 처리 중...</div>;
}
