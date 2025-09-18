import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const QnaFormPage = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post("http://localhost:8080/qna", {
                user: { id: "test-user" }, // 로그인된 사용자 ID (임시)
                product: { id: 1 },        // 질문할 상품 ID (임시)
                title,
                content,
                answer: null,
                answeredBy: null
            });

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
                <div>작성자(로그인 유저 아이디)</div>
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
