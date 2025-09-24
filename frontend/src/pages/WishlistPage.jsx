import {useEffect, useState} from "react";
import {useAuth} from "../contexts/AuthContext.jsx";
import {Container, Row, Col, Card, Button} from 'react-bootstrap';
import {FaHeart} from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import "../components/productlist/ProductCard.css"

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const nav = useNavigate();
    const {api} = useAuth();
    const productClick = (productId) => {
        nav(`/product/${productId}`);
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
            <h1 className="mb-4">찜한 상품</h1>
            <Row xs={1} md={2} lg={4} className="g-4">
                {wishlist.map((product) => (
                    <Col key={product.id}>
                        {/* CSS 클래스를 추가하여 마우스 오버 효과 적용 */}
                        <Card className="product-card h-100 shadow-sm border-0" onClick={() => productClick(product.id)}>
                            {/* CSS 클래스를 추가하여 이미지 컨테이너 효과 적용 */}
                            <div className="card-img-wrapper">
                                <Card.Img
                                    variant="top"
                                    // CSS 클래스를 추가하여 이미지 확대/축소 효과 적용
                                    className="card-img-top"
                                    src={product.mainImageId ? `${api.defaults.baseURL}/image/${product.mainImageId}` : "https://via.placeholder.com/200"}
                                    alt={product.name}
                                />
                                <div className="position-absolute top-0 end-0 m-2">
                                    <FaHeart size="24" color="red" />
                                </div>
                            </div>
                            <Card.Body>
                                <Card.Title className ="text-truncate">{product.name}</Card.Title>
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