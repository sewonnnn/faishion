import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {useSearchParams} from "react-router-dom";
import axios from "axios";

export default function LoginSuccessPage() {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();

    const code = searchParams.get("code");
    const state = searchParams.get("state");


    useEffect(() => {
        // 인가 코드가 없으면 로그인 페이지로 리디렉션
        if (!code) {
            alert("인가 코드를 받지 못했습니다. 다시 로그인해주세요.");
            nav("/login");
            return;
        }

        // 백엔드로 인가 코드와 state를 전송하는 함수
        const sendAuthCodeToBackend = async () => {
            try {
                // 백엔드에 새로 만들 소셜 로그인 처리 API 호출
                const res = await axios.post(
                    "http://localhost:8080/auth/login/naver", // 백엔드에 만들 새 API 엔드포인트
                    {
                        code: code,
                        state: state, // 네이버의 경우 state도 함께 전달
                        // 카카오/네이버를 구분하기 위한 provider 정보도 함께 전달하는 것이 좋습니다.
                        // 이 페이지로 리디렉션된 URL에서 provider를 파싱할 수 있다면 좋습니다.
                        // 예: /oauthcallback?provider=naver&code=...
                        // 지금은 provider를 URL에서 파싱한다고 가정하거나, 백엔드에서 code를 통해 알아낸다고 가정합니다.
                        // 여기서는 일단 백엔드에서 code와 state를 이용해 provider를 판단한다고 가정합니다.
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true, // HttpOnly 쿠키 사용 시 필수
                    }
                );
                console.log(res);

                // 백엔드에서 HttpOnly 쿠키로 JWT를 설정했다면, 클라이언트에서 특별히 할 일은 없습니다.
                // 성공적으로 요청을 보냈고, 백엔드에서 쿠키를 설정했으니 홈으로 이동합니다.
                alert("소셜 로그인 성공!");
                nav("/");
            } catch (error) {
                console.error("소셜 로그인 처리 중 오류 발생:", error);
                alert(error?.response?.data?.message || "소셜 로그인 처리 실패");
                nav("/login");
            }
        };

        sendAuthCodeToBackend();

    }, [code, state, nav]); // 의존성 배열에 code, state, nav 추가

    // 간단한 로딩 메시지
    return(
        <div>소셜 로그인 처리 중...</div>
        );

}