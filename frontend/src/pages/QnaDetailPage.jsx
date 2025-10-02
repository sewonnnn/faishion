import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "./QnaDetailPage.css";

const QnaDetailPage = () => {
    const { qnaId } = useParams();
    const navigate = useNavigate();
    const { api, user } = useAuth();

    const [qna, setQna] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedContent, setEditedContent] = useState("");

    const [answer, setAnswer] = useState("");

    const isAdmin = user.roles && user.roles.includes("ADMIN");
    const isSeller = user.roles && user.roles.includes("SELLER");
    const isAuthor = qna && user.sub === qna.user_id;

    const shouldShowAnswerForm = () => {
        if (!qna || qna.answer) return false;
        if (qna.qnaType === "GENERAL") return isAdmin;
        if (qna.qnaType === "PRODUCT") return isSeller;
        return false;
    };

    const showAnswerForm = shouldShowAnswerForm();

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const res = await api.get(`/qna/${qnaId}`);
                if (!ignore) {
                    setQna(res.data);
                    setEditedTitle(res.data.title);
                    setEditedContent(res.data.content);
                }
            } catch (e) {
                if (!ignore) setError(e);
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [qnaId, api]);

    const handleUpdate = async () => {
        try {
            await api.put(`/qna/${qnaId}`, {
                title: editedTitle,
                content: editedContent,
            });
            alert("게시글이 수정되었습니다.");
            setIsEditing(false);
            const res = await api.get(`/qna/${qnaId}`);
            setQna(res.data);
        } catch (e) {
            setError(e);
            alert("수정 실패");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            try {
                await api.delete(`/qna/${qnaId}`);
                alert("삭제가 완료되었습니다.");
                navigate("/qna/list");
            } catch (e) {
                setError(e);
                alert("삭제 실패");
                navigate("/qna/list");
            }
        }
    };

    const handleAnswerSubmit = async () => {
        if (!answer.trim()) {
            alert("답변 내용을 입력해주세요.");
            return;
        }
        try {
            await api.put(`/qna/answer/${qnaId}`, { answer });
            alert("답변이 등록되었습니다.");
            const res = await api.get(`/qna/${qnaId}`);
            setQna(res.data);
            setAnswer("");
        } catch (e) {
            const errorMessage =
                e.response && e.response.status === 403
                    ? "답변 권한이 없습니다."
                    : "답변 등록 중 오류가 발생했습니다.";
            setError(e);
            alert(errorMessage);
        }
    };

    if (loading) return <div className="qa-inner">불러오는 중…</div>;
    if (error) return <div className="qa-inner">불러오기 실패</div>;
    if (!qna) return <div className="qa-inner">데이터 없음</div>;

    return (
        <section className="qa-form">
            <div className="qa-inner">
                <h1>Q&A</h1>
                <div className="info-row">
                    <div>작성자 {qna.user_id}</div>
                    <div>
                        작성일{" "}
                        {new Date(qna.created_at)
                            .toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })
                            .replace(/\. /g, ".")
                            .slice(0, -1)}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">제목</label>
                    {isEditing ? (
                        <input
                            type="text"
                            className="form-control"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                        />
                    ) : (
                        <p className="form-control-plaintext">{qna.title}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="form-label">내용</label>
                    {isEditing ? (
                        <textarea
                            className="form-control"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        ></textarea>
                    ) : (
                        <p className="form-control-plaintext">{qna.content}</p>
                    )}
                </div>

                {/* 버튼 영역 (오른쪽 정렬 + 부트스트랩 스타일) */}
                <div className="d-flex justify-content-end gap-2 mt-3">
                    {isAuthor ? (
                        isEditing ? (
                            <>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(false)}
                                >
                                    취소
                                </button>
                                <button
                                    className="btn btn-dark"
                                    onClick={handleUpdate}
                                >
                                    수정 완료
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn btn-dark"
                                    onClick={handleDelete}
                                >
                                    삭제
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    수정
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate("/qna/list")}
                                >
                                    목록
                                </button>
                            </>
                        )
                    ) : (
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("/qna/list")}
                        >
                            목록
                        </button>
                    )}
                </div>

                {/* 답변 영역 */}
                <div className="answer-section">
                    <label className="form-label">답변</label>
                    {qna.answer ? (
                        <div className="answer-box">
                            <p>{qna.answer}</p>
                        </div>
                    ) : showAnswerForm ? (
                        <div className="answer-form">
                            <textarea
                                className="form-control"
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="답변 내용을 입력하세요..."
                                value={answer}
                            ></textarea>
                            <button
                                className="btn btn-dark mt-2 float-end"
                                onClick={handleAnswerSubmit}
                            >
                                답변 등록
                            </button>
                        </div>
                    ) : (
                        <p className="text-muted">아직 답변이 등록되지 않았습니다.</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default QnaDetailPage;
