import React from "react";
import {useEffect, useState} from "react";
import axios from "axios";
import "./QnaListPage.css";
import { Link } from "react-router-dom";

const QnaListPage = () => {
    const [qnaBoardList, setQnaBoardList] = useState([]);

    useEffect(() => {
        const qnaBoardData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/qna/list');
                console.log(response);
                if (Array.isArray(response.data)) {
                    setQnaBoardList(response.data);
                } else {
                    console.error('API response is not an array:', response.data);
                    setQnaBoardList([]);
                }
            } catch (error) {
                console.error('Error fetching qnaBoard data:', error);
                setQnaBoardList([]);
            }
        };
        qnaBoardData();
    }, []);

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
                                작성자
                            </button>
                        </th>
                        <th>제목</th>
                        <th>작성일</th>
                    </tr>
                    </thead>
                    <tbody>
                    {qnaBoardList.map((item, index) => (
                            <tr key={index}>
                                <td>{item.id}</td>
                                <td>{item.user_id}</td>
                                <td className="subject">
                                    <Link to={`/qna/${item.id}`}>
                                        {item.title}
                                    </Link>
                                </td>
                                <td> {new Date(item.created_at).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                }).replace(/\. /g, '.').slice(0, -1)}</td>
                            </tr>
                    ))}
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
                    <a className="btn-write" href="/qna/new">글쓰기</a>
                </div>
            </div>
        </section>
    );
}

export default QnaListPage;