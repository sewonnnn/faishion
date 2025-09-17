import React from "react";
import "./QnaListPage.css";

const QnaListPage = () => {


    return (
        <section className="qa">
            <div className="qa-inner">
                <h1 className="qa-title">Q&amp;A</h1>

                <table className="qa-table">
                    <colgroup>
                        <col style={{width:80}}/>
                        <col style={{width:160}}/>
                        <col/>
                        <col style={{width:160}}/>
                    </colgroup>
                    <thead>
                    <tr>
                        <th>No</th>
                        <th>
                            <button className="th-sort" type="button" aria-sort="none">
                                카테고리 <span className="caret"></span>
                            </button>
                        </th>
                        <th>제목</th>
                        <th>작성시간</th>
                    </tr>
                    </thead>
                    {/* 게시글 리스트 받아와서 뿌리기 */}
                    <tbody>
                    <tr>
                        <td>1</td>
                        <td>이용방법</td>
                        <td className="subject"><a href={"/qan/id"}>배송이 오지 않아요</a></td>
                        <td>2017-11-22</td>
                    </tr>
                    </tbody>
                </table>

                <div className="qa-actions">
                    <form className="qa-search" action="/qna" method="get">
                        <label className="sr-only" htmlFor="q">검색어</label>
                        <div className="search-input">
                            <input id="q" name="q" type="search" placeholder="Search"/>
                            <button className="icon-search" aria-label="검색" type="submit"></button>
                        </div>
                    </form>
                    <a className="btn-write" href="/qna/write">글쓰기</a>
                </div>
            </div>
        </section>

    );
}

export default QnaListPage;