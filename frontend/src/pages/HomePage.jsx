import Banner from "../components/productlist/Banner.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";
import {useEffect} from "react";

const HomePage = () => {

    const { api } = useAuth();
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // api 인스턴스를 사용하여 GET 요청을 보냄
                const response = await api.get('/category/groups');
                console.log("Categories:", response.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, [api]);

    return (
        <>
            <h1>HomePage</h1>
            <div className="productListPage_Banners">
                <Banner />
            </div>
        </>
    );
}

export default HomePage;