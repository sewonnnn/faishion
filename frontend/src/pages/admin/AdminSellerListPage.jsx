import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert, Pagination } from 'react-bootstrap';
// useAuth는 API 호출을 위해 필요하다고 가정합니다.
import { useAuth } from '../../contexts/AuthContext.jsx'; // 💡 useAuth import 가정
import "./AdminSellerListPage.css";

const AdminSellerListPage = () => {
    const { api } = useAuth(); // 💡 실제 API 호출을 위해 useAuth 사용

    // 로딩 및 오류 상태
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 판매자 데이터 상태
    const [sellers, setSellers] = useState([]);

    // 페이지네이션 관련 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(sellers.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSellers = sellers.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    // 💡 1. 판매자 목록을 서버에서 불러오는 함수
    const fetchSellers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // GET /admin/sellers/list 엔드포인트 호출
            const response = await api.get('/admin/sellers/list');
            console.log(response.data)
            setSellers(response.data);
            setCurrentPage(1); // 데이터 로딩 시 페이지 1로 리셋
        } catch (err) {
            console.error("판매자 목록 불러오기 실패:", err);
            setError("판매자 목록을 불러오는 데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 💡 2. 판매자 삭제 핸들러
    const handleDeleteSeller = async (sellerId) => {
        if (!window.confirm(`판매자 ID: ${sellerId}를 정말로 삭제하시겠습니까?`)) {
            return;
        }

        try {
            // DELETE /admin/sellers/{sellerId} 엔드포인트 호출
            const response = await api.delete(`/admin/sellers/${sellerId}`);

            // 삭제 성공 시, 화면에서도 해당 판매자 제거 및 메시지 표시
            setSellers(prevSellers => prevSellers.filter(seller => seller.id !== sellerId));
            alert(response.data || `판매자 ID: ${sellerId} 삭제 완료.`); // 백엔드 메시지 사용

        } catch (err) {
            console.error("판매자 삭제 실패:", err);
            // 서버에서 응답 메시지가 있다면 사용하고, 없다면 기본 메시지 사용
            const msg = err.response?.data || "판매자 삭제 처리 중 오류가 발생했습니다.";
            alert(msg);
        }
    };

    // 컴포넌트 마운트 시 데이터 로딩
    useEffect(() => {
        fetchSellers();
    }, []);

    if (isLoading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">판매자 목록을 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger" className="m-5">{error}</Alert>;
    }

    return (
        <Container className="my-5" style={{ maxWidth: '1000px' }}>
            <h3 className="mb-4">판매자 관리 목록</h3>

            <Table striped bordered hover responsive className="adminSeller-table text-center">
                <thead>
                    <tr>
                        <th style={{ width: '10%' }}>ID</th>
                        <th style={{ width: '20%' }}>상호명</th>
                        <th style={{ width: '15%' }}>대표 이름</th>
                        <th style={{ width: '20%' }}>이메일</th>
                        <th style={{ width: '15%' }}>가입일</th>
                        <th style={{ width: '15%' }}>액션</th>
                    </tr>
                </thead>
                <tbody style={{backgroundColor:"white"}}>
                    {currentSellers.length > 0 ? (
                        currentSellers.map((seller) => (
                            <tr key={seller.id}>
                                <td>{seller.id}</td>
                                <td className="text-center">{seller.businessName}</td>
                                <td>{seller.ownerName}</td>
                                <td className="text-center">{seller.email}</td>
                                <td>{new Date(seller.createdAt).toLocaleDateString('ko-KR')}</td>
                                <td>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteSeller(seller.id)}
                                    >
                                        삭제
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">등록된 판매자가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* 페이지네이션 컴포넌트 */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(totalPages)].map((_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === currentPage}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}
        </Container>
    );
};

export default AdminSellerListPage;