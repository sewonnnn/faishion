import { useState } from "react";
import {useAuth} from "../../contexts/AuthContext.jsx";

const SellerLoginPage = () => {
    const [form, setForm] = useState({ id: "", password: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const { api } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //엔드포인트 수정
            const res = await api.post('/auth/seller/login', form, {
                headers: { "Content-Type": "application/json" },
            });

            // 액세스 토큰 localStorage 저장 (서버가 내려주면)
            localStorage.setItem("SELLER_ACCESS", res.data.accessToken || "");
            alert("판매자 로그인 성공!");
        } catch (err) {
            alert(err.response?.data || "로그인 실패");
        }
    };

    return (
        <div>
            <h2>판매자 로그인</h2>
            <form onSubmit={handleSubmit}>
                <input name="id" placeholder="아이디" onChange={handleChange} required/>
                <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} required/>
                <button type="submit">로그인</button>
            </form>
        </div>
    );
};

export default SellerLoginPage;
