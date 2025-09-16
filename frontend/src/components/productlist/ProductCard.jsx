import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import {useEffect, useState} from "react";
import axios from "axios";

function ProductCard() {

    const [productCard, setProductCard] = useState([]);

    useEffect(() => {
        const fetchBannerData = async () => {
            try {
                const response = await axios.get('/api/product/productcard');
                if (Array.isArray(response.data)) {
                    setProductCard(response.data);
                } else {
                    console.error('API response is not an array:', response.data);
                    setProductCard([]);
                }
            } catch (error) {
                console.error('Error fetching banner data:', error);
                setProductCard([]);
            }
        };
        fetchBannerData();
    }, []);

    return (
        <Card style={{ width: '18rem' }}>
            {productCard.map((item, index) => (
                <div key={index}>
                    <Card.Img variant="top" src="react.svg/100px180" />
                    <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>{item.description}</Card.Text>
                        <Card.Text>{item.price}</Card.Text>
                        <Button variant="primary">Go somewhere</Button>
                    </Card.Body>
                </div>
            ))}
        </Card>
    );
}

export default ProductCard;