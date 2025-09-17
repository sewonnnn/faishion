import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import ProductLiftInfo from "../components/productdetail/ProductLiftInfo.jsx";
import ProductRightInfo from "../components/productdetail/ProductRightInfo.jsx";
import "./ProductDetailPage.css";
const mockdata = {
    id : 1,
    name : "목데이터",
    description : "목데이터",
    price : 20000
}
const ProductDetailPage = () => {
    const { productId } = useParams(); // URL에서 productId 추출
    const [product, setProduct] = useState(mockdata); // 이름 변경: banner -> bannerItems

    useEffect(() => {
        const productData = async () => {
            try {
                const response = await axios.get(`/api/product/${productId}`);
                console.log("선택된 id " +productId);

                if (Array.isArray(response.data)) {
                    setProduct(response.data);
                } else {
                    console.error('API response is not an array:', response.data);
                    setProduct(mockdata); // 에러 시 빈 배열로 초기화
                }
            } catch (error) {
                console.error('Error fetching banner data:', error);
                setProduct(mockdata); // 에러 시 빈 배열로 초기화
            }
        };
        productData();
    }, []);

    return (
        <div className={"ProductDetailPage"}>
            <h1>{product.name}</h1>
            <div className={"productInfo"}>
                <ProductLiftInfo />
                <ProductRightInfo productId={productId}/>
            </div>
        </div>
    );
}

export default ProductDetailPage;