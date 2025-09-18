import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { socialCallback } from "../api/auth";

export default function LoginSuccessPage() {
    const [sp] = useSearchParams();
    const nav = useNavigate();

    useEffect(() => {
        const userId = sp.get("userId");
        if (!userId) {
            nav("/login");
            return;
        }
        // userId -> 백엔드에 전달해서 JWT 발급
        socialCallback(userId)
            .then((res) => {
                localStorage.setItem("ACCESS", res.data.accessToken);
                localStorage.setItem("REFRESH", res.data.refreshToken);
                nav("/"); // 홈 이동
            })
            .catch(() => {
                alert("소셜 로그인 처리 실패");
                nav("/login");
            });
    }, []);

    return <div>소셜 로그인 처리 중...</div>;
}
