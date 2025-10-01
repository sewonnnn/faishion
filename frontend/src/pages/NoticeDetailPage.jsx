import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./NoticeDetailPage.css";
import { useAuth } from "../contexts/AuthContext.jsx";

const MAX_TITLE = 100;
const MAX_CONTENT = 5000;

const formatDate = (isoLike) => {
    if (!isoLike) return "-";
    const d = new Date(isoLike);
    if (Number.isNaN(d.getTime())) return "-";
    // 2024.10.03 형식
    return d
        .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
        .replace(/\. /g, ".")
        .slice(0, -1);
};

const NoticeDetailPage = () => {
    const { noticeId } = useParams();
    const navigate = useNavigate();
    const { api, user } = useAuth();

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedContent, setEditedContent] = useState("");

    const isAdmin = useMemo(() => {
        if (!user) return false;
        return user.role === "ADMIN" || user?.roles?.includes?.("ADMIN");
    }, [user]);

    // 상세 조회
    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                setLoading(true);
                const res = await api.get(`${api.defaults.baseURL}/notice/${noticeId}`);
                if (ignore) return;
                setNotice(res.data);
                setEditedTitle(res.data.title ?? "");
                setEditedContent(res.data.content ?? "");
                setError(null);
            } catch (e) {
                if (!ignore) setError(e);
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [api, noticeId]);

    const handleUpdate = async () => {
        const title = editedTitle.trim();
        const content = editedContent.trim();
        if (!title || !content) {
            alert("제목과 내용을 입력하세요.");
            return;
        }
        if (title.length > MAX_TITLE || content.length > MAX_CONTENT) {
            alert("입력 길이를 확인해주세요.");
            return;
        }
        try {
            setSaving(true);
            await api.put(`${api.defaults.baseURL}/notice/${noticeId}`, { title, content });
            alert("공지사항이 수정되었습니다.");
            setIsEditing(false);
            // 갱신
            const res = await api.get(`${api.defaults.baseURL}/notice/${noticeId}`);
            setNotice(res.data);
        } catch (e) {
            setError(e);
            alert(e?.response?.data || "수정 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await api.delete(`${api.defaults.baseURL}/notice/${noticeId}`);
            alert("삭제가 완료되었습니다.");
            navigate("/admin/notice/list");
        } catch (e) {
            setError(e);
            alert(e?.response?.data || "삭제 중 오류가 발생했습니다.");
        }
    };

    const goList = () => {
        navigate(isAdmin ? "/admin/notice/list" : "/notice/list");
    };

    if (loading)
        return (
            <section className="notice-detail">
                <div className="card"><div className="card-body">불러오는 중…</div></div>
            </section>
        );
    if (error)
        return (
            <section className="notice-detail">
                <div className="card"><div className="card-body">불러오기 실패</div></div>
            </section>
        );
    if (!notice)
        return (
            <section className="notice-detail">
                <div className="card"><div className="card-body">데이터 없음</div></div>
            </section>
        );

    // createdAt / created_at 어느 쪽이든 대응
    const created = notice.createdAt || notice.created_at;

    return (
        <section className="notice-detail">
            <div className="card">
                <div className="card-header">
                    <h1>공지사항</h1>
                    <div className="meta">
                        <span className="label">작성일</span>
                        <span className="value">{formatDate(created)}</span>
                    </div>
                </div>

                <div className="card-body">
                    {/* 제목 */}
                    <div className="row">
                        <label htmlFor="title">제목</label>
                        {isEditing ? (
                            <div className="editor">
                                <input
                                    id="title"
                                    type="text"
                                    className="form-control"
                                    placeholder="제목을 입력하세요"
                                    maxLength={MAX_TITLE}
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                />
                                <div className="count">{editedTitle.length}/{MAX_TITLE}</div>
                            </div>
                        ) : (
                            <div className="read">{notice.title}</div>
                        )}
                    </div>

                    {/* 내용 */}
                    <div className="row">
                        <label htmlFor="content">내용</label>
                        {isEditing ? (
                            <div className="editor">
                <textarea
                    id="content"
                    className="form-control textarea"
                    placeholder="내용을 입력하세요"
                    rows={12}
                    maxLength={MAX_CONTENT}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                />
                                <div className="count">{editedContent.length}/{MAX_CONTENT}</div>
                            </div>
                        ) : (
                            <div className="read prewrap">{notice.content}</div>
                        )}
                    </div>

                    {/* 버튼 */}
                    <div className="actions">
                        {isAdmin ? (
                            isEditing ? (
                                <>
                                    <button className="btn btn-light" onClick={() => setIsEditing(false)} disabled={saving}>취소</button>
                                    <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                                        {saving ? "수정 중..." : "수정 완료"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-light" onClick={goList}>목록</button>
                                    <button className="btn btn-outline" onClick={() => setIsEditing(true)}>수정</button>
                                    <button className="btn btn-danger" onClick={handleDelete}>삭제</button>
                                </>
                            )
                        ) : (
                            <button className="btn btn-light" onClick={goList}>목록</button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NoticeDetailPage;
