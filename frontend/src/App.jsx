import './App.css'
import "./styles/main.scss";
import { Container } from 'react-bootstrap';
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
import Header from "./components/common/Header.jsx";
import Gemini from "./pages/Gemini.jsx";
import Footer from "./components/common/Footer.jsx";
import SellerQnaListPage from "./pages/seller/SellerQnaListPage.jsx";
import NoticeListPage from "./pages/NoticeListPage.jsx";
import NoticeDetailPage from "./pages/NoticeDetailPage.jsx";
import QnaFormPage from "./pages/QnaFormPage.jsx";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage.jsx";
import AdminProductListPage from "./pages/admin/AdminProductListPage.jsx";
import SellerOrderListPage from "./pages/seller/SellerOrderListPage.jsx";
import SellerRegisterPage from "./pages/seller/SellerRegisterPage.jsx";
import SellerLoginPage from "./pages/seller/SellerLoginPage.jsx";
import QnaListPage from "./pages/QnaListPage.jsx";
import QnaDetailPage from "./pages/QnaDetailPage.jsx";
import LoginSuccessPage from "./pages/LoginSuccessPage.jsx";
import NoticeFormPage from "./pages/NoticeFormPage.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FailPage } from "./pages/tossPay/Fail.jsx";
import { SuccessPage } from "./pages/tossPay/Success.jsx";
import { CheckoutPage } from "./pages/tossPay/Checkout.jsx";
import SellerQnaDetail from "./components/seller/qna/SellerQnaDetail.jsx";
import MyPageDetail from "./pages/customer/MyPageDetail.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminReportList from "./pages/admin/AdminReportList.jsx";
import MyReviewList from "./pages/customer/MyReviewList";

import SideBar from "./components/common/SideBar.jsx";

function Layout() {
  return (
    <>
      <Container style={{ maxWidth: "1370px", width: "100%" }}>
        <Header />
        <Outlet />
        <Footer />
      </Container>
    </>
  );
}

const adminMenuItems = [
    {name : "추천 상품 관리", href : "/admin"},
    {name : "카테고리 관리", href : "/admin/category"},
    {name : "판매자 관리", href : "/admin/seller/list"},
    {name : "문의 글 관리", href : "/admin/qna/list"},
    {name : "신고 관리", href : "/admin/report/list"},
    {name : "공지사항 관리", href : "/admin/notice/list"},
];

const sellerMenuItems = [
    {name : "상품 관리", href : "/seller"},
    {name : "주문 현황 관리", href : "/seller/order/list"},
    {name : "문의 글 관리", href : "/seller/qna/list"},
];

function SellerLayout() {
    return (
        <div className="d-md-flex w-100 min-vh-100">
            <SideBar menuItems={sellerMenuItems}/>
            <div className="flex-grow-1 w-100 overflow-auto p-4">
                <Outlet />
            </div>
        </div>
    );
}


function AdminLayout() {
  return (
        <div className="d-md-flex w-100 min-vh-100" style={{ backgroundColor: '#F5F5F5' }} >
            <SideBar menuItems={adminMenuItems}/>
            <div className="flex-grow-1 w-100 overflow-auto p-4">
                <Outlet />
            </div>
        </div>
  );
}

function App() {
  const ProtectedRoute = ({ requiredRole }) => {
    const { user } = useAuth();
    const userRole = user?.roles[0];
    if (!userRole) {
      if (requiredRole !== "") {
        return <Navigate to="/" replace />;
      }
    } else if (requiredRole !== userRole) {
      if (userRole === "ADMIN") return <Navigate to="/admin" replace />;
      if (userRole === "SELLER") return <Navigate to="/seller" replace />;
      if (userRole === "USER" && requiredRole !== "")
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
  };

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute requiredRole={""} />}>
              <Route path="/admin/login" element={<AdminLoginPage />} /> {/*관리자 로그인*/}
              <Route path="/oauthcallback/naver" element={<LoginSuccessPage />}/> {/*소셜 로그인 콜백 페이지*/}
              <Route path="/oauthcallback/kakao" element={<LoginSuccessPage />}/> {/*소셜 로그인 콜백 페이지*/}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} /> {/*홈페이지*/}
                <Route path="/login" element={<LoginPage />} /> {/*로그인 페이지*/}
                <Route path="/register" element={<RegisterPage />} /> {/*회원가입 페이지*/}
                <Route path="/product/list" element={<ProductListPage />} /> {/* 전체 상품 목록 페이지*/}
                <Route path="/product/:productId" element={<ProductDetailPage />}/> {/*상품 상세 페이지*/}
                <Route path="/notice/list" element={<NoticeListPage />} /> {/* 공지사항 페이지 */}
                <Route path="/notice/:noticeId" element={<NoticeDetailPage />}/> {/* 공지사항 상세,수정 페이지 */}
                <Route path="/seller/register" element={<SellerRegisterPage />}/> {/*판매자 회원가입 페이지*/}
                <Route path="/seller/login" element={<SellerLoginPage />} /> {/*판매자 로그인 페이지*/}
              </Route>
            </Route>
            <Route element={<ProtectedRoute requiredRole={"USER"} />}>
              {/*로그인한 사용자만 접근 가능한 페이지들*/}
              <Route element={<Layout />}>
                <Route path="/cart" element={<CartPage />} /> {/*장바구니 페이지*/}
                <Route path="/gemini/:productId" element={<Gemini />} /> {/*옷 피팅 페이지*/}
                <Route path="/wishlist" element={<WishlistPage />} /> {/*찜 목록 페이지*/}
                <Route path="/order/:orderId" element={<OrderDetailPage />} /> {/*주문 상세 조회 페이지*/}
                <Route path="/order/new" element={<OrderFormPage />} /> {/*주문 상세 페이지*/}
                <Route path="/order/check" element={<CheckoutPage />} /> {/*토스 결제창 페이지*/}
                <Route path="/success" element={<SuccessPage />} /> {/*주문성공 페이지*/}
                <Route path="/fail" element={<FailPage />} /> {/*토스 실패 페이지*/}
                <Route path="/mypage" element={<MyPage />} /> {/*마이 페이지*/}
                <Route path="/mypage/detail" element={<MyPageDetail />} /> {/* 마이페이지 정보 수정 */}
                <Route path="/mypage/review" element={<MyReviewList />} /> {/* 본인 리뷰 확인 */}
                <Route path="/qna/list" element={<QnaListPage />} /> {/*문의사항 페이지*/}
                <Route path="/qna/:qnaId" element={<QnaDetailPage />} /> {/*문의사항 상세, 수정 페이지*/}
                <Route path="/qna/new" element={<QnaFormPage />} /> {/*문의사항 작성 페이지*/}
              </Route>
            </Route>
            <Route element={<ProtectedRoute requiredRole={"SELLER"} />}>
              <Route element={<SellerLayout />}>
                <Route path="/seller/order/list" element={<SellerOrderListPage />}/>
                <Route path="/seller/qna/list" element={<SellerQnaListPage />}/>
                <Route path="/seller" element={<SellerProductListPage />}/> {/*판매자 상품 목록 페이지*/}
                <Route path="/seller/product/:productId" element={<SellerProductDetailPage />}/> {/*판매자 상품 상세 조회 페이지*/}
                <Route path="/seller/product/new" element={<SellerProductFormPage />}/> {/*판매자 상품 등록 폼 페이지*/}
                <Route path="/seller/product/edit" element={<SellerProductFormPage />}/> {/*판매자 상품 편집 폼 페이지*/}
                <Route path="/seller/qna/:id" element={<SellerQnaDetail />} /> {/* 판매자 문의 상세보기 */}
              </Route>
            </Route>

             <Route element={<ProtectedRoute requiredRole={"ADMIN"} />}>
                <Route element={<AdminLayout/>}>
                   {/*관리자 권한이 있는 사용자만 접근 가능한 페이지들*/}
                   <Route path="/admin/notice/:noticeId" element={<NoticeDetailPage/>}/> {/*공지사항 작성 페이지*/}
                   <Route path="/admin/notice/new" element={<NoticeFormPage/>}/> {/*공지사항 작성 페이지*/}
                   <Route path="/admin/notice/list" element={<NoticeListPage/>}/> {/* 관리자 공지사항 목록 페이지 */}
                    <Route path="/admin" element={<AdminProductListPage />} />{/* 관리자 상품추천 페이지*/}
                   <Route path="/admin/category" element={<AdminCategoryPage />}/> {/*판매자 카테고리 페이지*/}
                   <Route path="/admin/seller/list" element={<AdminSellerListPage />} />   {/*관리자 판매자 목록 페이지*/}
                   <Route path="/admin/seller/:sellerId" element={<AdminSellerDetailPage />} />   {/*관리자 판매자 상세/권한 수정 페이지*/}
                   <Route path="/admin/report/list" element={<AdminReportList />} />   {/*관리자 신고글 확인 페이지 */}
                    <Route path="/admin/qna/list" element={<QnaListPage/>}/> {/*문의사항 페이지*/}
                    <Route path="/admin/qna/:qnaId" element={<QnaDetailPage/>}/> {/*문의사항 상세, 수정 페이지*/}
                 </Route>
             </Route>
         </Routes>
         </AuthProvider>
     </BrowserRouter>
    </>
  );
}

export default App;
