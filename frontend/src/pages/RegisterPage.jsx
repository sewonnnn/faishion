import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
    const nav = useNavigate();
    const [form, setForm] = useState({
        id: "",
        email: "",
        password: "",
        name: "",
        phoneNumber: ""
    });

    // 전화번호 자동 하이픈
    const formatPhoneNumber = (value) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({
            ...f,
            [name]: name === "phoneNumber" ? formatPhoneNumber(value) : value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/auth/register", form, {
                headers: { "Content-Type": "application/json" },
            });
            alert("회원가입 성공! 로그인 해주세요.");
            nav("/login");
        } catch (err) {
            alert(err?.response?.data || "회원가입 실패");
        }
    };

    return (
        <form onSubmit={onSubmit} style={{ maxWidth: 420, margin: "0 auto" }}>
            <h2>회원가입</h2>
            <input name="id" value={form.id} onChange={onChange} placeholder="아이디" required />
            <input name="email" value={form.email} onChange={onChange} placeholder="이메일" required />
            <input name="password" type="password" value={form.password} onChange={onChange} placeholder="비밀번호" required />
            <input name="name" value={form.name} onChange={onChange} placeholder="이름" required />
            <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={onChange}
                placeholder="010-0000-0000"
                type="tel"
                className="form-control"
                required
            />
            <button type="submit">가입하기</button>
        </form>
    );
}
