import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

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
        if (confirm("정말 삭제하시겠습니까?")) {
            try {
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


    return (
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
    );
};

export default QnaDetailPage;