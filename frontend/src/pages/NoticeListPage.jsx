import React, {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import "./NoticeListPage.css";

const NoticeListPage = () => {
    const [noticeBoardList, setNoticeBoardList] = useState([]); // 전체 게시글
    const [searchText, setSearchText] = useState(""); // 검색어 상태 관리

    const [page, setPage] = useState(0); // 현재 페이지 번호 상태
    const [totalPages, setTotalPages] = useState(0); // 총 페이지 수 상태
    const pageSize = 10; // 한 페이지당 고정된 게시물 수

    const [login, setLogin] = useState("admin"); // 관리자 관리 (임시)

    // 게시글 함수
    const fetchNoticeData = async (query = "", pageNum = 0) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/notice/list?q=${query}&page=${pageNum}`
            );

            setNoticeBoardList(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("데이터를 가져오는 중 오류 발생:", error);
            setNoticeBoardList([]);
        }
    };

    useEffect(() => {
        fetchNoticeData();
    }, []);


    // 검색어 입력 상태
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handlePageChange = (pageNum) => {
        setPage(pageNum); // 페이지 상태 업데이트
        fetchNoticeData(searchText, pageNum); // 새 페이지의 데이터 가져오기
    };

    //검색을 위한 함수
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0); // 검색 시 페이지를 0으로 초기화
        fetchNoticeData(searchText, 0);
    };
    return (
        <section className="notice">
            <div className="notice-inner">
                <h1 className="notice-title">공지사항</h1>

                <table className="notice-table">
                    <colgroup>
                        <col style={{width:80}}/>
                        <col style={{width:160}}/>
                        <col style={{width:160}}/>
                    </colgroup>
                    <thead>
                    <tr>
                        <th>No</th>
                        <th>제목</th>
                        <th>작성일</th>
                    </tr>
                    </thead>
                    <tbody>
                    {noticeBoardList && noticeBoardList.map((item, index) => {
                        // 페이지 번호와 배열 인덱스를 더해 전체 순번 계산
                        const sequentialNumber = (page * pageSize) + (index + 1);

                        return (
                            <tr key={index}>
                                <td>{sequentialNumber}</td>
                                <td className="subject">
                                    <Link to={`/notice/${item.id}`}>
                                        {item.title}
                                    </Link>
                                </td>
                                <td> {new Date(item.created_at).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                }).replace(/\. /g, '.').slice(0, -1)}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                <div className="notice-actions">
                    {/* 검색 영역 */}
                    <form className="notice-search" onSubmit={handleSearchSubmit}>
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
                    {/*관리자만 가능하게*/}
                 <div>{login === "admin" ? (<a className="btn-write" href="/notice/new">글쓰기</a>):("")}</div>
                </div>
                {/* 페이징 버튼 */}
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

export default NoticeListPage;