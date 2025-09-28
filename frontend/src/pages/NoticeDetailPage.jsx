import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import "./NoticeDetailPage.css";

const NoticeDetailPage = () => {
    const { noticeId } = useParams(); // id 받음
    const navigate = useNavigate();

    const [notice, setNotice] = useState(null); // 사용자가 보고 있는 게시물 데이터
    const [loading, setLoading] = useState(true); // 로딩 관리
    const [error, setError] = useState(null); // 에러 관리
    const [isEditing, setIsEditing] = useState(false); // 수정 상태 관리
    const [editedTitle, setEditedTitle] = useState(""); // 수정될 제목
    const [editedContent, setEditedContent] = useState(""); // 수정될 내용
    const [login, setLogin] = useState("admin"); // 관리자 관리 (임시)

    useEffect(() => {
        let ignore = false; // 작업 끝나기 전 컴포넌트가 살아있는지 확인을 위함
        (async () => {
            try {
                const res = await axios.get(`http://localhost:8080/notice/${noticeId}`);
                if (!ignore) {
                    setNotice(res.data);
                    // 상세보기 데이터 불러온 후 useState에 저장
                    setEditedTitle(res.data.title);
                    setEditedContent(res.data.content);
                    //  setAnsweredBy(res.data.answeredBy);
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
    }, [noticeId]); // qnaId 값이 변경될 때마다 실행되어야함


    // 수정 완료 버튼 클릭 시 호출될 함수
    const handleUpdate = async () => {
        try {
            //put: 전체 리소스 갱신
            await axios.put(`http://localhost:8080/notice/${noticeId}`, {
                title: editedTitle,
                content: editedContent,
            });
            alert("게시글이 수정되었습니다.");
            setIsEditing(false); // 수정 상태
            const res = await axios.get(`http://localhost:8080/notice/${noticeId}`); // 현재 qnaId를 가져옴
            setNotice(res.data);
        } catch (e) {
            setError(e);
            alert("수정 실패");
        }
    };

    // 삭제 버튼 클릭 시 호출될 함수
    const handleDelete = async () => {
        if (confirm("정말 삭제하시겠습니까?")) {
            try {
                // 삭제 API 호출
                await axios.delete(`http://localhost:8080/notice/${noticeId}`);
                alert("삭제가 완료되었습니다.");

                // 삭제 성공 후, 목록 페이지로 이동
                navigate("/notice/list");

            } catch (e) {
                setError(e);
                alert("삭제 실패");
                navigate("/notice/list");
            }
        }
    };
    if (loading) return <section className="notice-form"><div className="notice-inner">불러오는 중…</div></section>;
    if (error) return <section className="notice-form"><div className="notice-inner">불러오기 실패</div></section>;
    if (!notice) return <section className="notice-form"><div className="notice-inner">데이터 없음</div></section>;


    return (
        <>
            <section className="notice-form">
                <div className="notice-inner">
                    <h1>공지사항</h1>
                    <div>
                        <div> 작성일{new Date(notice.created_at).toLocaleDateString('ko-KR', {
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
                            <span>{notice.title}</span>
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
                            <p>{notice.content}</p>
                        )}
                    </div>
                    {login === "admin" ? (
                        isEditing ? (
                            <>
                                <button onClick={handleUpdate}>수정 완료</button>
                                <button onClick={() => setIsEditing(false)}>취소</button>
                            </>
                        ) : (
                            <>  <button onClick={handleDelete}>삭제</button>
                                <button onClick={() => setIsEditing(true)}>수정</button>
                                <button onClick={() => navigate("/notice/list")}>목록</button>
                            </>
                        )
                    ) : (
                        <>
                            <button onClick={() => navigate("/notice/list")}>목록</button>
                        </>
                    )}
                </div>
            </section>
        </>
    );
}

export default NoticeDetailPage;