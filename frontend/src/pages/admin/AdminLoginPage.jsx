import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Card } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";

const AdminLoginPage = () => {
    const nav = useNavigate();
    const [form, setForm] = useState({ id: "", password: "" });
    const [loading, setLoading] = useState(false);
    const { login, api } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log(`${api.defaults.baseURL}/auth/admin/login`);
            const res = await api.post(`${api.defaults.baseURL}/auth/admin/login`, form, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            login(res.data);
            alert("관리자 로그인 성공!");
            nav("/admin"); // 관리자 페이지로 이동
        } catch (err) {
            alert(err?.response?.data || "로그인 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: 480 }}>
            <Card className="p-4 shadow-sm">
                <h3 className="mb-4 text-center">관리자 로그인</h3>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>관리자 ID</Form.Label>
                        <Form.Control
                            name="id"
                            value={form.id}
                            onChange={handleChange}
                            placeholder="관리자 아이디"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>비밀번호</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="비밀번호"
                            required
                        />
                    </Form.Group>
                    <Button type="submit" className="w-100" disabled={loading}>
                        {loading ? "로그인 중..." : "로그인"}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default AdminLoginPage;
