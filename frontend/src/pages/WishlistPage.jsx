import {useEffect, useState} from "react";
import {useAuth} from "../contexts/AuthContext.jsx";
import {Container, Row, Col, Card, Button} from 'react-bootstrap';
import {FaHeart} from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import "../pages/WishlistPage.css"

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const nav = useNavigate();
    const {api} = useAuth();
    const productClick = (productId) => {
        nav(`/product/${productId}`);
    };

    // 위시 취소(삭제) 
    const onWishCancel = async (productId) => {
        await api.delete(`/wish/delete/${productId}`);
    };

// 하트 클릭 시 찜하기 즉시 제거
    const handleWishClick = async (e, productId) => {
        e.stopPropagation();        // 카드 onClick으로 상세 이동되는 것 방지
        try {
            // 서버 호출 성공/실패와 무관하게 UI는 먼저 반영(옵티미스틱)
            setWishlist((prev) => prev.filter((p) => p.id !== productId));
            await onWishCancel(productId);
        } catch (err) {
            console.error("찜 취소 실패:", err);
            // 실패 시 되돌리고 싶다면 아래처럼 복구 로직을 넣을 수 있음
            // setWishlist(prev => [...prev, cachedItem]);
            alert("찜 취소 중 오류가 발생했어요.");
        }
    };
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await api.get('/wish/list');
                const responseData = response.data;
                console.log('위시리스트 데이터:', responseData);

                if (Array.isArray(responseData)) {
                    setWishlist(responseData);
                } else {
                    console.error("API 응답 형식이 배열이 아닙니다:", responseData);
                    setError("데이터 형식이 올바르지 않습니다.");
                    setWishlist([]);
                }
            } catch (err) {
                console.error('위시리스트 데이터를 불러오는 중 오류 발생:', err);
                setError('위시리스트를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, [api]);

    if (loading) {
        return <div className="text-center mt-5">위시리스트를 불러오는 중입니다...</div>;
    }

    if (error) {
        return <div className="text-center mt-5 text-danger">{error}</div>;
    }

    if (wishlist.length === 0) {
        return <div className="text-center mt-5">찜한 상품이 없습니다.</div>;
    }

    return (
        <Container className="mt-5">
            <h4 className="mb-4">찜한 상품</h4>
            <Row xs={2} md={4} lg={5} className="g-0">
                {wishlist.map((product) => (
                    <Col key={product.id}>
                        <Card
                            className="product-card h-100 border-0"
                            onClick={() => productClick(product.id)}
                        >
                            <div className="card-img-wrapper">
                                <Card.Img
                                    variant="top"
                                    className="card-img-top"
                                    src={
                                        product.mainImageId
                                            ? `${api.defaults.baseURL}/image/${product.mainImageId}`
                                            : "https://via.placeholder.com/200"
                                    }
                                    alt={product.name}
                                />
                                <button
                                    type="button"
                                    className="wish-btn position-absolute top-0 end-0 m-2"
                                    onClick={(e) => handleWishClick(e, product.id)} // ✅ 여기!
                                    aria-label="찜 취소"
                                >
                                    <FaHeart size={24} color="red" />
                                </button>
                            </div>
                            <Card.Body>
                                <Card.Title className="text-truncate">{product.name}</Card.Title>
                                <Card.Text>
                                    <strong>{product.price.toLocaleString()}원</strong>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>


        </Container>
    );
};

export default WishlistPage;