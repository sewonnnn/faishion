import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./QnaDetailPage.css";

const QnaDetailPage = () => {
    const { qnaId } = useParams(); // id 받음
    const navigate = useNavigate();

    const [qna, setQna] = useState(null); // 사용자가 보고 있는 게시물 데이터
    const [loading, setLoading] = useState(true); // 로딩 관리
    const [error, setError] = useState(null); // 에러 관리
    const [isEditing, setIsEditing] = useState(false); // 수정 상태 관리
    const [editedTitle, setEditedTitle] = useState(""); // 수정될 제목
    const [editedContent, setEditedContent] = useState(""); // 수정될 내용
    const [login, setLogin] = useState("sewon"); // 로그인 유저 관리 (임시)

    // --- 답글 기능 ---
    const [answer, setAnswer] = useState(""); // 답변 내용 상태
    const [answeredBy, setAnsweredBy] = useState("boom"); // 답변자 관리 (임시)


    useEffect(() => {
        let ignore = false; // 작업 끝나기 전 컴포넌트가 살아있는지 확인을 위함
        (async () => {
            try {
                const res = await axios.get(`http://localhost:8080/qna/${qnaId}`);
                if (!ignore) {
                    setQna(res.data);
                    // 상세보기 데이터 불러온 후 useState에 저장
                    setEditedTitle(res.data.title);
                    setEditedContent(res.data.content);
                    setAnsweredBy(res.data.answeredBy);
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
    }, [qnaId]); // qnaId 값이 변경될 때마다 실행되어야함


    // 수정 완료 버튼 클릭 시 호출될 함수
    const handleUpdate = async () => {
        try {
            //put: 전체 리소스 갱신
            await axios.put(`http://localhost:8080/qna/${qnaId}`, {
                title: editedTitle,
                content: editedContent,
            });
            alert("게시글이 수정되었습니다.");
            setIsEditing(false); // 수정 상태
            const res = await axios.get(`http://localhost:8080/qna/${qnaId}`); // 현재 qnaId를 가져옴
            setQna(res.data);
        } catch (e) {
            setError(e);
            alert("수정 실패");
        }
    };

    // 삭제 버튼 클릭 시 호출될 함수
    const handleDelete = async () => {
        // isDelete 상태를 통해 중복 클릭을 방지합니다.
        if (confirm("정말 삭제하시겠습니까?")) {
            try {
                // 삭제 API 호출
                await axios.delete(`http://localhost:8080/qna/${qnaId}`);
                alert("삭제가 완료되었습니다.");

                // 삭제 성공 후, 목록 페이지로 이동
                navigate("/qna/list");

            } catch (e) {
                setError(e);
                alert("삭제 실패");
                navigate("/qna/list");
            }
        }
    };
    if (loading) return <section className="qa-form"><div className="qa-inner">불러오는 중…</div></section>;
    if (error) return <section className="qa-form"><div className="qa-inner">불러오기 실패</div></section>;
    if (!qna) return <section className="qa-form"><div className="qa-inner">데이터 없음</div></section>;

    // 답변 등록 버튼 클릭 시 호출될 함수
    const handleAnswerSubmit = async () => {

        if (!answer.trim()) {
            alert("답변 내용을 입력해주세요.");
            return;
        }
        try {
            await axios.put(`http://localhost:8080/qna/answer/${qnaId}`, {
                answer: answer
            });
            alert("답변이 등록되었습니다.");

            const res = await axios.get(`http://localhost:8080/qna/${qnaId}`);
            setQna(res.data);
            setAnswer("");

        } catch (e) {
            setError(e);
            alert("답변 등록 실패");
        }
    };

    return (
       <>
        <section className="qa-form">
            <div className="qa-inner">
                <h1>Q&A</h1>
                <div>
                    <div>작성자 {qna.user_id}</div>
                    <div> 작성일{new Date(qna.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).replace(/\. /g, '.').slice(0, -1)}</div>

                    <label>제목</label><br/>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                        />
                    ) : (
                        <span>{qna.title}</span>
                    )}
                </div>

                <div>
                    <label>내용</label><br />
                    {isEditing ? (
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        ></textarea>
                    ) : (
                        <p>{qna.content}</p>
                    )}
                </div>
                {login === "sewon" ? (
                    isEditing ? (
                        <>
                            <button onClick={handleUpdate}>수정 완료</button>
                            <button onClick={() => setIsEditing(false)}>취소</button>
                        </>
                    ) : (
                        <>  <button onClick={handleDelete}>삭제</button>
                            <button onClick={() => setIsEditing(true)}>수정</button>
                            <button onClick={() => navigate("/qna/list")}>목록</button>
                        </>
                    )
                ) : (
                    <>
                        <button onClick={() => navigate("/qna/list")}>목록</button>
                    </>
                )}
            </div>
        </section>
           {/* 답변 영역 */}
           <div className="answer-section">
               <label>답변</label><br />
               {qna.answer ? (
                   // 이미 답변이 있을 경우
                   <div className="answer-box">
                       <p>{qna.answer}</p>
                       <small className="answered-by">
                           답변자: {answeredBy}
                       </small>
                   </div>
               ) : (
                   // 답변이 없을 경우에만 답변 폼 표시
                   <div className="answer-form">
                            <textarea
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="답변 내용을 입력하세요..."
                            ></textarea>
                       <button onClick={handleAnswerSubmit}>답변 등록</button>
                   </div>
               )}
           </div>
       </>
    );
};

export default QnaDetailPage;