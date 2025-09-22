import { useState } from "react";
import axios from "axios";

const SellerLoginPage = () => {
    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/seller/login", form, {
                headers: { "Content-Type": "application/json" },
            });

            // 액세스 토큰 localStorage 저장
            localStorage.setItem("SELLER_ACCESS", res.data.accessToken);
            alert("판매자 로그인 성공!");
        } catch (err) {
            alert(err.response?.data || "로그인 실패");
        }
    };

    return (
        <div>
            <h2>판매자 로그인</h2>
            <form onSubmit={handleSubmit}>
                <input name="email" placeholder="이메일" onChange={handleChange} />
                <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} />
                <button type="submit">로그인</button>
            </form>
        </div>
    );
};

export default SellerLoginPage;
