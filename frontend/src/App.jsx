import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Routes, Route, Outlet, Navigate, useLocation} from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProductListPage from "./pages/ProductListPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import OrderFormPage from "./pages/OrderFormPage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import MyPage from "./pages/MyPage.jsx";
import SellerPage from "./pages/seller/SellerPage.jsx";
import SellerProductListPage from "./pages/seller/SellerProductListPage.jsx";
import SellerProductDetailPage from "./pages/seller/SellerProductDetailPage.jsx";
import SellerProductFormPage from "./pages/seller/SellerProductFormPage.jsx";
import AdminPage from "./pages/admin/AdminPage.jsx";
import AdminSellerListPage from "./pages/admin/AdminSellerListPage.jsx";
import AdminSellerDetailPage from "./pages/admin/AdminSellerDetailPage.jsx";
import AdminHeader from "./components/common/AdminHeader.jsx";
import SellerHeader from "./components/common/SellerHeader.jsx";
import Header from "./components/common/Header.jsx";
import Gemini from "./pages/Gemini.jsx";
import Footer from "./components/common/Footer.jsx";
import SellerQnaListPage from "./pages/seller/SellerQnaListPage.jsx";
import AdminNoticeListPage from "./pages/admin/AdminNoticeListPage.jsx";
import NoticeListPage from "./pages/NoticeListPage.jsx";
import NoticeDetailPage from "./pages/NoticeDetailPage.jsx";
import QnaFormPage from "./pages/QnaFormPage.jsx";
import SellerCategoryPage from "./pages/seller/SellerCategoryPage.jsx";
import SellerOrderListPage from "./pages/seller/SellerOrderListPage.jsx";
import SellerRegisterPage from "./pages/seller/SellerRegisterPage.jsx";
import SellerLoginPage from "./pages/seller/SellerLoginPage.jsx";
import QnaListPage from "./pages/QnaListPage.jsx";
import QnaDetailPage from "./pages/QnaDetailPage.jsx";
import LoginSuccessPage from "./pages/LoginSuccessPage.jsx";
import NoticeFormPage from "./pages/NoticeFormPage.jsx";
import {AuthProvider, useAuth} from './contexts/AuthContext';
import {FailPage} from "./pages/tossPay/Fail.jsx";
import {SuccessPage} from "./pages/tossPay/Success.jsx";
import {CheckoutPage} from "./pages/tossPay/Checkout.jsx";
import SellerQnaDetail from "./components/seller/qna/SellerQnaDetail.jsx";
import MyPageDetail from "./pages/customer/MyPageDetail.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";

function Layout() {
    return (
        <>
            <Header/>
            <Outlet/>
            <Footer/>
        </>
    );
}

function SellerLayout() {
    return (
        <>
            <SellerHeader/>
            <Outlet/>
        </>
    );
}

function AdminLayout() {
    return (
        <>
            <AdminHeader/>
            <Outlet/>
        </>
    );
}

function App() {
    const ProtectedRoute = ({requiredRole})=>{
        const { user } = useAuth();
        const userRole = user?.roles[0];
        if (!userRole) {
            if (requiredRole !== "") {
                return <Navigate to="/" replace />;
            }
        }else if(requiredRole !== userRole){
            if(userRole === "ADMIN") return <Navigate to="/admin" replace/>;
            if(userRole === "SELLER") return <Navigate to="/seller" replace/>;
            if(userRole === "USER" && requiredRole !== "") return <Navigate to="/" replace/>;
        }
        return <Outlet/>;
    }

  return (
    <>
     <BrowserRouter>
         <AuthProvider>
         <Routes>
             <Route element={<Layout/>}>
                 <Route element={<ProtectedRoute requiredRole={""} />}>
                     <Route path="/" element={<HomePage/>}/>   {/*홈페이지*/}
                     <Route path="/admin/login" element={<AdminLoginPage/>}/>   {/*관리자 로그인*/}
                     <Route path="/oauthcallback/naver" element={<LoginSuccessPage />} />   {/*소셜 로그인 콜백 페이지*/}
                     <Route path="/oauthcallback/kakao" element={<LoginSuccessPage />} />   {/*소셜 로그인 콜백 페이지*/}
                     <Route path="/login" element={<LoginPage />} />   {/*로그인 페이지*/}

                     <Route path="/register" element={<RegisterPage />} />   {/*회원가입 페이지*/}

                                <Route path="/product/list" element={<ProductListPage/>}/> {/* 전체 상품 목록 페이지*/}
                                <Route path="/product/:productId" element={<ProductDetailPage/>}/> {/*상품 상세 페이지*/}
                                <Route path="/notice/list" element={<NoticeListPage/>}/> {/* 공지사항 페이지 */}
                                <Route path="/notice/:noticeId" element={<NoticeDetailPage/>}/> {/* 공지사항 상세,수정 페이지 */}
                                <Route path="/notice/new" element={<NoticeFormPage/>}/> {/*공지사항 작성 페이지*/}
                                <Route path="/seller/register" element={<SellerRegisterPage/>}/> {/*판매자 회원가입 페이지*/}
                                <Route path="/seller/login" element={<SellerLoginPage/>}/> {/*판매자 로그인 페이지*/}
                            </Route>
                            <Route element={<ProtectedRoute requiredRole={"USER"}/>}>
                                {/*로그인한 사용자만 접근 가능한 페이지들*/}
                                <Route path="/cart" element={<CartPage/>}/> {/*장바구니 페이지*/}
                                <Route path="/gemini/:productId" element={<Gemini/>}/> {/*옷 피팅 페이지*/}
                                <Route path="/wishlist" element={<WishlistPage/>}/> {/*찜 목록 페이지*/}
                                <Route path="/order/:orderId" element={<OrderDetailPage/>}/> {/*주문 상세 조회 페이지*/}
                                <Route path="/order/new" element={<OrderFormPage/>}/> {/*주문 상세 페이지*/}
                                <Route path="/order/check" element={<CheckoutPage/>}/> {/*토스 결제창 페이지*/}
                                <Route path="/success" element={<SuccessPage/>}/> {/*주문성공 페이지*/}
                                <Route path="/fail" element={<FailPage/>}/> {/*토스 실패 페이지*/}
                                <Route path="/mypage" element={<MyPage/>}/> {/*마이 페이지*/}
                                <Route path="/mypage/detail" element={<MyPageDetail/>}/> {/* 마이페이지 정보 수정 */}
                                <Route path="/qna/list" element={<QnaListPage/>}/> {/*문의사항 페이지*/}
                                <Route path="/qna/:qnaId" element={<QnaDetailPage/>}/> {/*문의사항 상세, 수정 페이지*/}
                                <Route path="/qna/new" element={<QnaFormPage/>}/> {/*문의사항 작성 페이지*/}
                            </Route>
                        </Route>
                        <Route element={<ProtectedRoute requiredRole={"SELLER"}/>}>
                            <Route element={<SellerLayout/>}>
                                <Route path="/seller/order/list" element={<SellerOrderListPage/>}/>
                                <Route path="/seller/qna/list" element={<SellerQnaListPage/>}/>
                                <Route path="/seller" element={<SellerPage/>}/> {/*판매자 대시보드*/}
                                <Route path="/seller/category" element={<SellerCategoryPage/>}/> {/*판매자 카테고리 페이지*/}
                                <Route path="/seller/product/list"
                                       element={<SellerProductListPage/>}/> {/*판매자 상품 목록 페이지*/}
                                <Route path="/seller/product/:productId"
                                       element={<SellerProductDetailPage/>}/> {/*판매자 상품 상세 조회 페이지*/}
                                <Route path="/seller/product/new"
                                       element={<SellerProductFormPage/>}/> {/*판매자 상품 등록 폼 페이지*/}
                                <Route path="/seller/product/edit"
                                       element={<SellerProductFormPage/>}/> {/*판매자 상품 편집 폼 페이지*/}
                                <Route path="/seller/qna/:id" element={<SellerQnaDetail/>}/> {/* 판매자 문의 상세보기 */}
                            </Route>
                        </Route>

             <Route element={<ProtectedRoute requiredRole={"ADMIN"} />}>
                <Route element={<AdminLayout/>}>
                   {/*관리자 권한이 있는 사용자만 접근 가능한 페이지들*/}
                     <Route path="/admin/notice/list" element={<AdminNoticeListPage/>}/> {/* 관리자 공지사항 목록 페이지 */}
                   <Route path="/admin" element={<AdminPage />} />   {/*관리자 대시보드*/}
                   <Route path="/admin/seller/list" element={<AdminSellerListPage />} />   {/*관리자 판매자 목록 페이지*/}
                   <Route path="/admin/seller/:sellerId" element={<AdminSellerDetailPage />} />   {/*관리자 판매자 상세/권한 수정 페이지*/}
                 </Route>
             </Route>
         </Routes>
         </AuthProvider>
     </BrowserRouter>
    </>
  )
}

export default App
