import { useState } from "react";
import {useAuth} from "../../contexts/AuthContext.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SellerRegisterPage = () => {
    const nav = useNavigate();
    const { api } = useAuth();
    const [form, setForm] = useState({
        id: "",
        password: "",
        confirmPassword: "",
        emailLocal: "",
        emailDomain: "naver.com",
        customDomain: "",
        phoneNumber: "",
        businessNumber: "",
        businessName: "",
        ownerName: "",
    });

    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const [idMessage, setIdMessage] = useState({ text: "", color: "red" });
    const [pwMessage, setPwMessage] = useState({ text: "", color: "red" });
    const [confirmPwMessage, setConfirmPwMessage] = useState({ text: "", color: "red" });
    const [emailMessage, setEmailMessage] = useState({ text: "", color: "red" });

    // ✅ 사업자번호 유효성 메시지 & 제출 가드
    const [businessMessage, setBusinessMessage] = useState({ text: "", color: "red" });
    const [isBusinessValid, setIsBusinessValid] = useState(false);

    // 전화번호 자동 하이픈
    const formatPhoneNumber = (value) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    };

    // 사업자등록번호 자동 하이픈 (3-2-5)
    const formatBusinessNumber = (value) => {
        const digits = value.replace(/\D/g, "");
        if (digits.length <= 3) return digits;
        if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phoneNumber") {
            setForm((f) => ({ ...f, [name]: formatPhoneNumber(value) }));
            return;
        }
        if (name === "businessNumber") {
            setForm((f) => ({ ...f, [name]: formatBusinessNumber(value) }));
            // 번호 수정 시 이전 유효성 결과는 초기화(선택)
            setIsBusinessValid(false);
            setBusinessMessage({ text: "", color: "red" });
            return;
        }

        setForm((f) => ({ ...f, [name]: value }));

        if (name === "password") validatePassword(value);
        if (name === "confirmPassword") validateConfirmPw(value, form.password);
    };

    // 아이디 정규식 검사
    const validateId = () => {
        const regex = /^[a-z0-9]{8,16}$/;
        if (!regex.test(form.id)) {
            setIdMessage({ text: "아이디는 영소문자+숫자 조합, 8~16자여야 합니다.", color: "red" });
            return false;
        }
        return true;
    };

    // 아이디 중복검사
    const checkId = async () => {
        if (!validateId()) return;
        try {
            const res = await api.post('/auth/check-id', { id: form.id });
            setIdMessage({ text: res.data, color: "green" });
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
            setPwMessage({ text: "비밀번호는 영소문자+숫자+특수문자 포함 8~16자여야 합니다.", color: "red" });
        } else {
            setPwMessage({ text: "사용 가능한 비밀번호입니다.", color: "green" });
        }
    };

    // 비밀번호 확인 검사
    const validateConfirmPw = (confirmPw, pw) => {
        if (!pw) {
            setConfirmPwMessage({ text: "", color: "red" });
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
            const res = await api.post('/auth/check-email', { email });
            setEmailMessage({ text: res.data, color: "green" });
        } catch (err) {
            setEmailMessage({
                text: err.response?.data || "중복검사 실패",
                color: "red",
            });
        }
    };

    // -------------------------------
    // 사업자등록번호 유효성 검사
    // -------------------------------
    const onlyDigits = (s) => (s || "").replace(/\D/g, "");
    const isValidBRNFormat = (digits) => /^\d{10}$/.test(digits); // 10자리

    // 국세청 표준 체크섬 (가중치: 1,3,7,1,3,7,1,3,5, 보정 포함)
    const isValidBRNChecksum = (digits) => {
        if (!isValidBRNFormat(digits)) return false;
        const d = digits.split("").map(Number);
        const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += d[i] * weights[i];
        sum += Math.floor((d[8] * 5) / 10); // 보정항
        const check = (10 - (sum % 10)) % 10;
        return check === d[9];
    };

    const checkBusinessNumber = async () => {
        const digits = onlyDigits(form.businessNumber);

        // 1) 포맷/체크섬 즉시 검증
        if (!isValidBRNFormat(digits)) {
            setBusinessMessage({ text: "형식이 올바르지 않습니다. 예: 123-45-67890", color: "red" });
            setIsBusinessValid(false);
            return;
        }
        if (!isValidBRNChecksum(digits)) {
            setBusinessMessage({ text: "유효하지 않은 사업자등록번호입니다(검증 실패).", color: "red" });
            setIsBusinessValid(false);
            return;
        }

        // 2) 서버/공공 API 조회
        try {
            // 응답 예시: { exists: true/false, status: "ACTIVE"|"CLOSED"|... }
            const res = await api.post("/auth/seller/check-business", {
                businessNumber: digits,
            });
            const { exists, status } = res.data || {};
            /*
            const exists = true;
            const status = "ACTIVE";
            */
            if (!exists) {
                setBusinessMessage({ text: "조회되지 않는 번호입니다.", color: "red" });
                setIsBusinessValid(false);
                return;
            }

            if (status === "ACTIVE" || status === "정상") {
                setBusinessMessage({ text: "조회됨: 정상(영업) 사업자입니다.", color: "green" });
                setIsBusinessValid(true);
            } else if (status === "CLOSED" || status === "휴폐업") {
                setBusinessMessage({ text: "조회됨: 휴·폐업 상태입니다.", color: "orange" });
                setIsBusinessValid(false); // 정책에 따라 변경 가능
            } else {
                setBusinessMessage({ text: `조회됨: 상태=${status}`, color: "gray" });
                setIsBusinessValid(false);
            }
        } catch (err) {
            setBusinessMessage({ text: "조회에 실패했습니다. 잠시 후 다시 시도해주세요.", color: "gray" });
            setIsBusinessValid(true);
        }
    };

    // 제출
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 선택: 사업자번호 유효성 검사 강제
        if (!isBusinessValid) {
            alert("사업자등록번호 유효성 검사를 완료해주세요.");
            return;
        }

        const email =
            form.emailLocal + "@" + (form.emailDomain === "custom" ? form.customDomain : form.emailDomain);

        try {
            // confirmPassword는 제외하고 보냄
            const payload = {
                id: form.id,
                password: form.password,
                email,
                phoneNumber: form.phoneNumber,
                businessNumber: onlyDigits(form.businessNumber), // 서버엔 숫자만 전달 권장
                businessName: form.businessName,
                ownerName: form.ownerName,
            };

            await api.post('/auth/seller/register', payload, {
                headers: { "Content-Type": "application/json" },
            });

            alert("판매자 회원가입을 축하드립니다! 로그인 해주세요");
            nav("/login");
        } catch (err) {
            alert(err.response?.data || "회원가입 실패");
        }
    };

    return (
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 className="text-center mb-4">판매자 회원가입</h2>
            <form onSubmit={handleSubmit}>
                {/* 아이디 */}
                <div className="mb-3">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                            type="text"
                            name="id"
                            placeholder="아이디"
                            value={form.id}
                            onChange={handleChange}
                            className="form-control"
                            style={{ flex: 1 }}
                            required
                        />
                        <button
                            type="button"
                            onClick={checkId}
                            style={{
                                marginLeft: "8px",
                                whiteSpace: "nowrap",
                                height: "38px",
                                padding: "0 12px",
                                fontWeight: "bold",
                                background: "black",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            중복검사
                        </button>
                    </div>
                    <div style={{ marginTop: "4px", color: idMessage.color }}>{idMessage.text}</div>
                </div>

                {/* 비밀번호 */}
                <div className="mb-3 position-relative">
                    <input
                        type={showPw ? "text" : "password"}
                        name="password"
                        placeholder="비밀번호"
                        value={form.password}
                        onChange={handleChange}
                        className="form-control pe-5"
                        required
                    />
                    <span
                        onClick={() => setShowPw(!showPw)}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "16px",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#888",
                        }}
                        title={showPw ? "숨기기" : "보이기"}
                    >
            {showPw ? <FaEyeSlash /> : <FaEye />}
          </span>
                    <div style={{ marginTop: "4px", color: pwMessage.color }}>{pwMessage.text}</div>
                </div>

                {/* 비밀번호 확인 */}
                <div className="mb-3 position-relative">
                    <input
                        type={showConfirmPw ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="비밀번호 확인"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="form-control pe-5"
                        required
                    />
                    <span
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "16px",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#888",
                        }}
                        title={showConfirmPw ? "숨기기" : "보이기"}
                    >
            {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
          </span>
                    <div style={{ marginTop: "4px", color: confirmPwMessage.color }}>{confirmPwMessage.text}</div>
                </div>

                {/* 이메일 */}
                <div className="mb-3">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="text"
                            name="emailLocal"
                            placeholder="이메일 아이디"
                            value={form.emailLocal}
                            onChange={handleChange}
                            className="form-control"
                            style={{ flex: 1, minWidth: 0 }}
                        />
                        <span>@</span>
                        {form.emailDomain === "custom" ? (
                            <input
                                type="text"
                                name="customDomain"
                                placeholder="직접입력"
                                value={form.customDomain}
                                onChange={handleChange}
                                className="form-control"
                                style={{ flex: 1, minWidth: 0 }}
                            />
                        ) : (
                            <select
                                name="emailDomain"
                                value={form.emailDomain}
                                onChange={handleChange}
                                className="form-select"
                                style={{ width: "150px" }}
                            >
                                <option value="naver.com">naver.com</option>
                                <option value="gmail.com">gmail.com</option>
                                <option value="daum.net">daum.net</option>
                                <option value="nate.com">nate.com</option>
                                <option value="outlook.com">outlook.com</option>
                                <option value="custom">직접입력</option>
                            </select>
                        )}
                        <button
                            type="button"
                            onClick={checkEmail}
                            style={{
                                whiteSpace: "nowrap",
                                height: "38px",
                                padding: "0 12px",
                                fontWeight: "bold",
                                background: "black",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            중복검사
                        </button>
                    </div>
                    <div style={{ marginTop: "4px", color: emailMessage.color }}>{emailMessage.text}</div>
                </div>

                {/* 휴대폰 번호 */}
                <div className="mb-3">
                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="휴대폰 번호 (예: 010-1234-5678)"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        className="form-control"
                        inputMode="numeric"
                        required
                    />
                </div>

                {/* 사업자 등록번호 */}
                <div className="mb-3">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                            type="text"
                            name="businessNumber"
                            placeholder="사업자등록번호 (예: 123-45-67890)"
                            value={form.businessNumber}
                            onChange={handleChange}
                            className="form-control"
                            inputMode="numeric"
                            required
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={checkBusinessNumber}
                            style={{
                                marginLeft: "8px",
                                whiteSpace: "nowrap",
                                height: "38px",
                                padding: "0 12px",
                                fontWeight: "bold",
                                background: "black",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            유효성검사
                        </button>
                    </div>
                    <div style={{ marginTop: "4px", color: businessMessage.color }}>{businessMessage.text}</div>
                </div>

                {/* 상호명 */}
                <div className="mb-3">
                    <input
                        type="text"
                        name="businessName"
                        placeholder="상호명"
                        value={form.businessName}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                {/* 대표자 이름 */}
                <div className="mb-4">
                    <input
                        type="text"
                        name="ownerName"
                        placeholder="대표자 이름"
                        value={form.ownerName}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    회원가입
                </button>
            </form>
        </div>
    );
};

export default SellerRegisterPage;
