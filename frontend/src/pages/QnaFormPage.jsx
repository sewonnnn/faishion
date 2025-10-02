import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css"; // 부트스트랩 CSS

const QnaFormPage = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();
    const { api, user } = useAuth();

    if (!user.roles || !user.roles.includes("USER")) {
        navigate("/qna/list", { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/qna", {
                title,
                content,
                answer: null,
                answeredBySeller: null,
                answeredByAdmin: null,
            });
            alert("게시글이 등록되었습니다.");
            navigate("/qna/list");
        } catch (error) {
            console.error("Error posting QnA", error);
            alert("등록 중 오류가 발생했습니다.");
        }
    };

    const handleCancel = () => {
        if (confirm("작성을 취소하고 목록으로 돌아가시겠습니까?")) {
            navigate("/qna/list");
        }
    };

    return (
        <section className="qa-form container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="mb-4">Q&A 작성하기</h1>
                    <div className="text-muted mb-3">작성자: {user.sub}</div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">제목</label>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">내용</label>
                            <textarea
                                className="form-control"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows="7"
                                placeholder={`접수된 문의는 순차적으로 답변해 드리고 있습니다. 정확한 답변을 위해 문의 내용을 상세히 작성해 주세요.
필요 시, 문의하신 내용에 대해 전화로 연락드릴 수 있습니다.
- 운영시간 : 오전 10시 ~ 오후 5시 (평일)`}
                                required
                            />
                        </div>

                        {/* 버튼 영역 */}
                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCancel}
                            >
                                취소
                            </button>
                            <button type="submit" className="btn btn-dark">
                                등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default QnaFormPage;
