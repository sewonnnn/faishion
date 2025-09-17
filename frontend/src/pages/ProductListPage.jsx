import ProductCard from "../components/productlist/ProductCard.jsx";
import Banner from "../components/productlist/Banner.jsx";

const ProductListPage = () => {
    return (
        <div className="productListPage">
            <div className="productListPage_Header">
                <h1>ProductListPage</h1>
            </div>
            <div className="productListPage_Banner">
                <Banner/>
            </div>
            <div className="productListPage_ProductList">
                <ProductCard/>
            </div>
        </div>
    );
}

export default ProductListPage;