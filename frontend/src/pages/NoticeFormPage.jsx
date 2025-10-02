import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "./NoticeFormPage.css";

const MAX_TITLE = 100;
const MAX_CONTENT = 5000;

const NoticeFormPage = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { api, user } = useAuth();

    // 관리자 가드 (role 필드 명은 프로젝트에 맞춰 조정)
    const isAdmin = useMemo(() => {
        if (!user) return false;
        // 예: user.roles 배열 or user.role 문자열 등 프로젝트 규약에 맞게 교체
        return user.role === "ADMIN" || user?.roles?.includes?.("ADMIN");
    }, [user]);

    useEffect(() => {
        if (user && !isAdmin) {
            alert("접근 권한이 없습니다. (관리자 전용)");
            navigate("/"); // 혹은 admin 대시보드가 아닌 곳으로
        }
    }, [user, isAdmin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        try {
            setLoading(true);
            await api.post(`${api.defaults.baseURL}/notice`, {
                title: title.trim(),
                content: content.trim(),
            });
            alert("공지사항이 등록되었습니다.");
            navigate("/admin/notice/list");
        } catch (error) {
            console.error("Error posting notice", error);
            alert(error?.response?.data || "등록 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const titleCount = `${title.length}/${MAX_TITLE}`;
    const contentCount = `${content.length}/${MAX_CONTENT}`;
    const disabled = loading || !title.trim() || !content.trim();

    return (
        <section className="admin-notice-form">
            <div className="card">
                <div className="card-header">
                    <h1>공지사항</h1>
                    <p className="subtitle">관리자만 작성할 수 있습니다.</p>
                </div>

                <form onSubmit={handleSubmit} className="card-body">
                    {/* 제목 */}
                    <div className="form-row">
                        <label htmlFor="title">제목</label>
                        <input
                            id="title"
                            type="text"
                            className="form-control"
                            placeholder="제목을 입력하세요"
                            maxLength={MAX_TITLE}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <div className="count">{titleCount}</div>
                    </div>

                    {/* 내용 */}
                    <div className="form-row">
                        <label htmlFor="content">내용</label>
                        <textarea
                            id="content"
                            className="form-control textarea"
                            placeholder="내용을 입력하세요"
                            rows={10}
                            maxLength={MAX_CONTENT}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                        <div className="count">{contentCount}</div>
                    </div>

                    {/* 버튼 그룹 */}
                    <div className="actions">
                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => navigate("/admin/notice/list")}
                            disabled={loading}
                        >
                            목록으로
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={disabled}>
                            {loading ? "등록 중..." : "등록하기"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default NoticeFormPage;
