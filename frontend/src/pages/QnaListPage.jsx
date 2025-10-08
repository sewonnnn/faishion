import React from "react";
import {useEffect, useState} from "react";
import "./QnaListPage.css";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.jsx";

const QnaListPage = () => {
    const [qnaBoardList, setQnaBoardList] = useState([]); // 전체 게시글
    const [searchText, setSearchText] = useState(""); // 검색어 상태 관리

    const [page, setPage] = useState(0); // 현재 페이지 번호 상태
    const [totalPages, setTotalPages] = useState(0); // 총 페이지 수 상태
    const pageSize = 10; // 한 페이지당 고정된 게시물 수
    const navigate = useNavigate();
    const {api, user} = useAuth();

    // 게시글 함수
    const fetchQnaData = async (query = "", pageNum = 0) => {
        try {
            const response = await api.get(
                `/qna/admin/list?q=${query}&page=${pageNum}`
            );

            setQnaBoardList(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("데이터를 가져오는 중 오류 발생:", error);
            setQnaBoardList([]);
        }
    };

    useEffect(() => {
        fetchQnaData();
    }, []);


    // 검색어 입력 상태
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handlePageChange = (pageNum) => {
        setPage(pageNum); // 페이지 상태 업데이트
        fetchQnaData(searchText, pageNum); // 새 페이지의 데이터 가져오기
    };

    //검색을 위한 함수
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0); // 검색 시 페이지를 0으로 초기화
        fetchQnaData(searchText, 0);
    };

    //상세페이지 이동을 위한 함수
    const handleGoDetail = (id)=>{
        if(user.roles == "ADMIN"){
            navigate(`/admin/qna/${id}`);
        }else{
            navigate(`/qna/${id}`);
        }
    }

    return (
        <section className="qa">
            <div className="qa-inner">
                <h1 className="qa-title">Q&amp;A</h1>

                <table className="qa-table">
                    <colgroup>
                        <col style={{width:80}}/>
                        <col style={{width:160}}/>
                        <col style={{width:160}}/>
                        <col style={{width:120}}/>
                    </colgroup>
                    <thead>
                    <tr>
                        <th>No</th>
                        <th>제목</th>
                        <th>작성시간</th>
                        <th>답변상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {qnaBoardList && qnaBoardList.map((item, index) => {
                        // 페이지 번호와 배열 인덱스를 더해 전체 순번을 계산
                        const sequentialNumber = (page * pageSize) + (index + 1);
                        return (
                            <tr key={index} onClick={()=>handleGoDetail(item.id)} style={{ cursor: 'pointer' }}>
                                <td>{sequentialNumber}</td>
                                <td className="subject">
                                        {item.title}
                                </td>
                                <td> {new Date(item.created_at).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                }).replace(/\. /g, '.').slice(0, -1)}</td>
                                {item.answer ? (
                                    <td>답변 완료</td>
                                ) : (
                                    <td>답변 대기</td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                <div className="qa-actions">
                    {/* 검색 영역 */}
                    <form className="qa-search" onSubmit={handleSearchSubmit}>
                        <label className="sr-only" htmlFor="q">검색어</label>
                        <div className="search-input">
                            <input
                                id="q"
                                name="q"
                                type="text"
                                placeholder="Search"
                                value={searchText}
                                onChange={handleSearchChange}
                            />
                            <button className="icon-search" aria-label="검색" type="submit"></button>
                        </div>
                    </form>
                    {user.roles && user.roles.includes('USER') && (
                        <a className="btn-write" href="/qna/new">글쓰기</a>
                    )}
                </div>
                {/* 페이징 버튼 (기능 유지를 위해 별도로 배치) */}
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i} onClick={() => handlePageChange(i)} disabled={i === page}>
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default QnaListPage;