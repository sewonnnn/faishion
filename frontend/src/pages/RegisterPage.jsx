import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function RegisterPage() {
    const nav = useNavigate();
    const [form, setForm] = useState({
        id: "",
        password: "",
        confirmPassword: "",
        emailLocal: "",
        emailDomain: "naver.com",
        customDomain: "",
        name: "",
        phoneNumber: ""
    });

    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [idMessage, setIdMessage] = useState({ text: "", color: "red" });
    const [emailMessage, setEmailMessage] = useState({ text: "", color: "red" });
    const [pwMessage, setPwMessage] = useState({ text: "", color: "red" });
    const [confirmPwMessage, setConfirmPwMessage] = useState({ text: "", color: "red" });

    // 전화번호 자동 하이픈
    const formatPhoneNumber = (value) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    };

    // 입력 핸들러
    const onChange = (e) => {
        const { name, value } = e.target;

        // 전화번호 입력 시 자동 하이픈 적용
        if (name === "phoneNumber") {
            setForm((f) => ({ ...f, [name]: formatPhoneNumber(value) }));
            return;
        }

        setForm((f) => ({ ...f, [name]: value }));

        if (name === "password") {
            validatePassword(value);
            validateConfirmPw(form.confirmPassword, value); // 비번 바뀌면 확인칸도 재검사
        }
        if (name === "confirmPassword") {
            validateConfirmPw(value, form.password);
        }
    };

    // 아이디 정규식 검사
    const validateId = () => {
        const regex = /^[a-z0-9]{8,16}$/;
        if (!regex.test(form.id)) {
            setIdMessage("아이디는 영소문자와 숫자 조합, 8~16자여야 합니다.");
            return false;
        }
        return true;
    };

    // 아이디 중복검사
    const checkId = async () => {
        if (!validateId()) return;
        try {
            const res = await axios.post("http://localhost:8080/auth/check-id", { id: form.id });
            setIdMessage({ text: res.data, color: "green" }); // 사용 가능
        } catch (err) {
            setIdMessage({
                text: err.response?.data || "중복검사 실패",
                color: "red",
            });
        }
    };

    // 비밀번호 정규식 검사
    const validatePassword = (pw) => {
        const regex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/;
        if (!regex.test(pw)) {
            setPwMessage({
                text: "비밀번호는 영소문자+숫자+특수문자 포함 8~16자여야 합니다.",
                color: "red",
            });
        } else {
            setPwMessage({
                text: "사용 가능한 비밀번호입니다.",
                color: "green",
            });
        }
    };

// 비밀번호 확인 검사
    const validateConfirmPw = (confirmPw, pw) => {
        if (!pw) {
            setConfirmPwMessage({ text: "", color: "red" }); // 비밀번호 없으면 메시지 안띄움
            return;
        }
        if (!confirmPw) {
            setConfirmPwMessage({ text: "비밀번호 확인을 입력해주세요.", color: "red" });
        } else if (confirmPw !== pw) {
            setConfirmPwMessage({ text: "비밀번호가 일치하지 않습니다.", color: "red" });
        } else {
            setConfirmPwMessage({ text: "비밀번호가 일치합니다.", color: "green" });
        }
    };

    // 이메일 중복검사
    const checkEmail = async () => {
        const email =
            form.emailLocal + "@" + (form.emailDomain === "custom" ? form.customDomain : form.emailDomain);

        try {
            const res = await axios.post("http://localhost:8080/auth/check-email", { email });
            setEmailMessage({ text: res.data, color: "green" });
        } catch (err) {
            setEmailMessage({
                text: err.response?.data || "중복검사 실패",
                color: "red",
            });
        }
    };

    // 회원가입 제출
    const onSubmit = async (e) => {
        e.preventDefault();

        const email =
            form.emailLocal + "@" + (form.emailDomain === "custom" ? form.customDomain : form.emailDomain);

        try {
            await axios.post("http://localhost:8080/auth/register", {
                id: form.id,
                password: form.password,
                email,
                name: form.name,
                phoneNumber: form.phoneNumber,
            });
            // alert("회원가입을 축하드립니다! 로그인 해주세요");
            // nav("/login");
            nav("/login", { state: { message: "회원가입을 축하드립니다! 로그인 해주세요" } });
        } catch (err) {
            alert(err.response?.data || "회원가입 실패");
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <h2>회원가입</h2>
            <form onSubmit={onSubmit}>
                {/* 아이디 */}
                <div>
                    <input
                        type="text"
                        name="id"
                        placeholder="아이디"
                        value={form.id}
                        onChange={onChange}
                    />
                    <button type="button" onClick={checkId}>
                        중복검사
                    </button>
                    <div style={{ color: idMessage.color }}>{idMessage.text}</div>
                </div>

                {/* 비밀번호 */}
                <div>
                    <input
                        type={showPw ? "text" : "password"}
                        name="password"
                        placeholder="비밀번호"
                        value={form.password}
                        onChange={onChange}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}>
                        {showPw ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <div style={{ color: pwMessage.color }}>{pwMessage.text}</div>
                </div>

                {/* 비밀번호 확인 */}
                <div>
                    <input
                        type={showConfirmPw ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="비밀번호 확인"
                        value={form.confirmPassword}
                        onChange={onChange}
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                        {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <div style={{ color: confirmPwMessage.color }}>{confirmPwMessage.text}</div>
                </div>

                {/* 이메일 */}
                <div>
                    <input
                        type="text"
                        name="emailLocal"
                        placeholder="이메일 아이디"
                        value={form.emailLocal}
                        onChange={onChange}
                    />
                    @
                    {form.emailDomain === "custom" ? (
                        <input
                            type="text"
                            name="customDomain"
                            placeholder="직접입력"
                            value={form.customDomain}
                            onChange={onChange}
                        />
                    ) : (
                        <select
                            name="emailDomain"
                            value={form.emailDomain}
                            onChange={onChange}
                        >
                            <option value="naver.com">naver.com</option>
                            <option value="gmail.com">gmail.com</option>
                            <option value="daum.net">daum.net</option>
                            <option value="nate.com">nate.com</option>
                            <option value="outlook.com">outlook.com</option>
                            <option value="custom">직접입력</option>
                        </select>
                    )}
                    <button type="button" onClick={checkEmail}>
                        중복검사
                    </button>
                    <div style={{ color: emailMessage.color }}>{emailMessage.text}</div>
                </div>

                {/* 이름 */}
                <div>
                    <input
                        type="text"
                        name="name"
                        placeholder="이름"
                        value={form.name}
                        onChange={onChange}
                    />
                </div>

                {/* 전화번호 */}
                <div>
                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="전화번호"
                        value={form.phoneNumber}
                        onChange={onChange}
                    />
                </div>

                <button type="submit">회원가입</button>
            </form>
        </div>
    );
}
