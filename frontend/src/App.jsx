import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProductListPage from "./pages/ProductListPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import OrderFormPage from "./pages/OrderFormPage.jsx";
import OrderCompletePage from "./pages/OrderCompletePage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import MyPage from "./pages/MyPage.jsx";
import SellerPage from "./pages/SellerPage.jsx";
import SellerProductListPage from "./pages/SellerProductListPage.jsx";
import SellerProductDetailPage from "./pages/SellerProductDetailPage.jsx";
import SellerProductFormPage from "./pages/SellerProductFormPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AdminSellerListPage from "./pages/AdminSellerListPage.jsx";
import AdminSellerDetailPage from "./pages/AdminSellerDetailPage.jsx";
import AdminHeader from "./components/common/AdminHeader.jsx";
import SellerHeader from "./components/common/SellerHeader.jsx";
import Header from "./components/common/Header.jsx";
import Gemini from "./pages/Gemini.jsx";
import Footer from "./components/common/Footer.jsx";
import SellerQnaListPage from "./pages/SellerQnaListPage.jsx";
import AdminNoticeListPage from "./pages/AdminNoticeListPage.jsx";
import NoticeListPage from "./pages/NoticeListPage.jsx";
import NoticeDetailPage from "./pages/NoticeDetailPage.jsx";
import QnaFormPage from "./pages/QnaFormPage.jsx";

function Layout() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
}

function SellerLayout() {
    return (
        <>
            <SellerHeader />
            <Outlet />
        </>
    );
}

function AdminLayout() {
    return (
        <>
            <AdminHeader />
            <Outlet />
        </>
    );
}

function App() {
  return (
    <>
     <BrowserRouter>
         <Routes>
             <Route element={<Layout/>}>
                 <Route path="/" element={<HomePage/>}/>   {/*홈페이지*/}
                 <Route path="/login" element={<LoginPage />} />   {/*로그인 페이지*/}
                 <Route path="/register" element={<RegisterPage />} />   {/*회원가입 페이지*/}

               <Route path="/product/list" element={<ProductListPage />} />  {/* 전체 상품 목록 페이지*/}
               <Route path="/product/:productId" element={<ProductDetailPage />} />   {/*상품 상세 페이지*/}
                <Route path="/notice/list" element={<NoticeListPage/>} /> {/* 공지사항 페이지 */ }
                 <Route path="/notice/:noticeId" element={<NoticeDetailPage/>} /> {/* 공지사항 상세 페이지 */ }
               {/*로그인한 사용자만 접근 가능한 페이지들*/}
               <Route path="/cart" element={<CartPage />} />   {/*장바구니 페이지*/}
               <Route path="/gemini" element={<Gemini />} />   {/*옷 피팅 페이지*/}
               <Route path="/wishlist" element={<WishlistPage />} />   {/*찜 목록 페이지*/}
               <Route path="/order/new" element={<OrderFormPage />} />   {/*주문/결제 폼 페이지*/}
               <Route path="/order/complete" element={<OrderCompletePage />} />   {/*주문 완료 페이지*/}
               <Route path="/order/:orderId" element={<OrderDetailPage />} />   {/*주문 상세 조회 페이지*/}
               <Route path="/mypage" element={<MyPage />} />   {/*마이 페이지*/}
                 <Route path="/qna/new" element={<QnaFormPage/>}/>
               {/*판매자 권한이 있는 사용자만 접근 가능한 페이지들*/}
                 <Route path="/login" element={<LoginPage />} />   {/*로그인 페이지*/}
                 <Route path="/register" element={<RegisterPage />} />   {/*회원가입 페이지*/}
             {/*<Route element={<Layout/>}>*/}
                <Route path="/" element={<HomePage/>}/>   {/*홈페이지*/}
                <Route path="/product/list" element={<ProductListPage />} />  {/* 전체 상품 목록 페이지*/}
                <Route path="/product/:productId" element={<ProductDetailPage />} />   {/*상품 상세 페이지*/}
                {/*로그인한 사용자만 접근 가능한 페이지들*/}
                <Route path="/cart" element={<CartPage />} />   {/*장바구니 페이지*/}
                <Route path="/wishlist" element={<WishlistPage />} />   {/*찜 목록 페이지*/}
                <Route path="/order/new" element={<OrderFormPage />} />   {/*주문/결제 폼 페이지*/}
                <Route path="/order/complete" element={<OrderCompletePage />} />   {/*주문 완료 페이지*/}
                <Route path="/order/:orderId" element={<OrderDetailPage />} />   {/*주문 상세 조회 페이지*/}
                <Route path="/mypage" element={<MyPage />} />   {/*마이 페이지*/}
             {/*</Route>*/}
            {/*판매자 권한이 있는 사용자만 접근 가능한 페이지들*/}
            {/*<Route element={<SellerLayout/>}>*/}
               <Route path="/seller" element={<SellerPage />} />   {/*판매자 대시보드*/}
                 <Route path="/seller/product/list" element={<SellerProductListPage />} />   {/*판매자 상품 목록 페이지*/}
                 <Route path="/seller/product/:productId" element={<SellerProductDetailPage />} />   {/*판매자 상품 상세 조회 페이지*/}
                 <Route path="/seller/product/new" element={<SellerProductFormPage />} />   {/*판매자 상품 등록 폼 페이지*/}
                 <Route path="/seller/product/edit/:productId" element={<SellerProductFormPage />} />   {/*판매자 상품 편집 폼 페이지*/}
            {/*</Route>*/}
            {/* <Route element={<AdminLayout/>}>*/}
               {/*관리자 권한이 있는 사용자만 접근 가능한 페이지들*/}
               <Route path="/admin" element={<AdminPage />} />   {/*관리자 대시보드*/}
               <Route path="/admin/seller/list" element={<AdminSellerListPage />} />   {/*관리자 판매자 목록 페이지*/}
               <Route path="/admin/seller/:sellerId" element={<AdminSellerDetailPage />} />   {/*관리자 판매자 상세/권한 수정 페이지*/}
             {/*</Route>*/}
             </Route>
         </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
