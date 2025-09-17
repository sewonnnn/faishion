import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const QnaDetailPage = () => {
    const { qnaId } = useParams();
    const navigate = useNavigate();

    const [qna, setQna] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const res = await axios.get(`http://localhost:8080/qna/${qnaId}`);
                if (!ignore) setQna(res.data);
            } catch (e) {
                if (!ignore) setError(e);
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => { ignore = true; };
    }, [qnaId]);

    if (loading) return <section className="qa-form"><div className="qa-inner">불러오는 중…</div></section>;
    if (error)   return <section className="qa-form"><div className="qa-inner">불러오기 실패</div></section>;
    if (!qna)    return <section className="qa-form"><div className="qa-inner">데이터 없음</div></section>;

    return (
        <section className="qa-form">
            <div className="qa-inner">
                <h1>Q&A</h1>

                <div>
                    <label>제목</label><br/>
                    {qna.title}
                </div>

                <div>
                    <label>내용</label><br/>
                    {qna.content}
                </div>

                <button onClick={() => navigate("/qna/list")}>목록</button>
            </div>
        </section>
    );
};

export default QnaDetailPage;
