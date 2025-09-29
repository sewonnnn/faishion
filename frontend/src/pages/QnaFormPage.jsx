import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.jsx";

const QnaFormPage = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();
    const {api, user} = useAuth();

    if (!user.roles || !user.roles.includes('USER')) {
        // 권한이 없으면 목록으로 리디렉션
        navigate("/qna/list", { replace: true });
        return null; // 렌더링 중단
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/qna", {
                title,
                content,
                answer: null,
                answeredBySeller: null,
                answeredByAdmin: null
            });
            alert("게시글이 등록되었습니다.");
            // 등록 성공 시 QnA 목록 페이지로 이동
            navigate("/qna/list");
        } catch (error) {
            console.error("Error posting QnA", error);
            alert("등록 중 오류가 발생했습니다.");
        }
    };

    return (
        <section className="qa-form">
            <div className="qa-inner">
                <h1>Q&A 작성하기</h1>
                <div>{user.sub}</div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>제목</label><br/>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>내용</label><br/>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="5"
                            required
                        />
                    </div>
                    <button type="submit">등록하기</button>
                </form>
            </div>
        </section>
    );
};

export default QnaFormPage;
