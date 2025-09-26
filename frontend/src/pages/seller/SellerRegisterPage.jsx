import { useState } from "react";
import axios from "axios";

const SellerRegisterPage = () => {
    const [form, setForm] = useState({
        id: "",
        password: "",
        email: "",
        phoneNumber: "",
        businessName: "",
        businessNumber: "",
        ownerName: ""
    });

    // 전화번호 자동 하이픈
    const formatPhoneNumber = (value) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "phoneNumber" ? formatPhoneNumber(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/auth/seller/register", form, {
                headers: { "Content-Type": "application/json" },
            });
            alert(res.data); // "판매자 회원가입 성공"
        } catch (err) {
            alert(err.response?.data || "회원가입 실패");
        }
    };

    return (
        <div>
            <h2>판매자 회원가입</h2>
            <form onSubmit={handleSubmit}>
                <input name="id" placeholder="아이디" onChange={handleChange} required />
                <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} required />
                <input name="email" placeholder="이메일" onChange={handleChange} required />
                <input
                    name="phoneNumber"
                    placeholder="휴대폰 번호"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    required
                />
                <input name="businessNumber" placeholder="사업자 등록번호" onChange={handleChange} required />
                <input name="businessName" placeholder="상호명" onChange={handleChange} required />
                <input name="ownerName" placeholder="대표자 이름" onChange={handleChange} required />
                <button type="submit">회원가입</button>
            </form>
        </div>
    );
};

export default SellerRegisterPage;
