import React, { useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import Banner from "../components/productlist/Banner.jsx";
import axios from 'axios';
import ProductList from "../components/productlist/ProductList.jsx";
import { Container } from 'react-bootstrap';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [typeName, setTypeName] = useState('');
    const pageSize = 10;
    const location = useLocation();
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryId = searchParams.get('categoryId');
        const searchQuery = searchParams.get('searchQuery');
        const type = searchParams.get('type');
        setLoading(true);

        const fetchProducts = async () => {
            try {
                // categoryId와 searchQuery를 사용하여 API 호출
                const response = await axios.get('/api/product/list', {
                    params: {
                        categoryId: categoryId, // URL에서 읽어온 categoryId 사용
                        searchQuery: searchQuery, // URL에서 읽어온 searchQuery 사용
                        type: type,
                        page: currentPage,
                        size: pageSize
                    }
                });
                console.log(response.data);
                setProducts(response.data.content);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            } catch (error) {
                console.error("상품 목록을 불러오는 중 오류가 발생했습니다:", error);
                setLoading(false);
            }
        };
        switch (type){
            case "new":
                setTypeName("신상");
                break;
            case "best":
                setTypeName("베스트");
                break;
            case "sale":
                setTypeName("할인상품");
                break;
            case "common":
                setTypeName("공용");
                break;
            case "man":
                setTypeName("남성");
                break;
            case "woman":
                setTypeName("여성");
                break;
            case "pick":
                setTypeName("추천");
                break;
            default:
                break;
        }
        fetchProducts();
    }, [location.search, currentPage]);


    return (
        <Container className="my-5">
            <h4 className="text-center mb-4 mt-3 rounded py-2">{typeName ? typeName : "전체상품"}</h4>
            <ProductList
                products={products}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
            />
        </Container>
    );
};

export default ProductListPage;