import Banner from "../components/productlist/Banner.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";
import React, {useEffect} from "react";
import ProductListPage from "./ProductListPage.jsx";
import ImageSplitView from '../components/home/ImageSplitView';

const HomePage = () => {
    return (
        <>
            <h1>HomePage</h1>
            <ImageSplitView skewed={true} />
            <div className="productListPage_Banners">
                <Banner />
                <ProductListPage/>
            </div>
        </>
    );
}

export default HomePage;