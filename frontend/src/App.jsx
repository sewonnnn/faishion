import './App.css'
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

function App() {
  return (
    <>
{/*     <BrowserRouter> */}
{/*         <Routes> */}
{/*              */}{/* 공용 페이지 */}
{/*             <Route path="/" element={<HomePage/>}/>  */}{/* 홈페이지 */}
{/*             <Route path="/login" element={<LoginPage />} />  */}{/* 로그인 페이지 */}
{/*             <Route path="/register" element={<RegisterPage />} />  */}{/* 회원가입 페이지 */}
{/*             <Route path="/product/list" element={<ProductListPage />} />  */}{/* 전체 상품 목록 페이지 */}
{/*             <Route path="/product/:productId" element={<ProductDetailPage />} />  */}{/* 상품 상세 페이지 */}
{/*              */}{/* 로그인한 사용자만 접근 가능한 페이지들 */}
{/*             <Route element={<PrivateRoute />}> */}
{/*               <Route path="/cart" element={<CartPage />} />  */}{/* 장바구니 페이지 */}
{/*               <Route path="/wishlist" element={<WishlistPage />} />  */}{/* 찜 목록 페이지 */}
{/*               <Route path="/order/new" element={<OrderFormPage />} />  */}{/* 주문/결제 폼 페이지 */}
{/*               <Route path="/order/complete" element={<OrderCompletePage />} />  */}{/* 주문 완료 페이지 */}
{/*               <Route path="/order/:orderId" element={<OrderDetailPage />} />  */}{/* 주문 상세 조회 페이지 */}
{/*               <Route path="/mypage" element={<MyPage />} />  */}{/* 마이 페이지 */}
{/*             </Route> */}
{/*              */}{/* 판매자 권한이 있는 사용자만 접근 가능한 페이지들 */}
{/*             <Route element={<PrivateRoute role="seller" />}> */}
{/*               <Route path="/seller" element={<SellerPage />} />  */}{/* 판매자 대시보드 */}
{/*                 <Route path="/seller/product/list" element={<SellerProductListPage />} />  */}{/* 판매자 상품 목록 페이지 */}
{/*                 <Route path="/seller/product/:productId" element={<SellerProductDetailPage />} />  */}{/* 판매자 상품 상세 조회 페이지 */}
{/*                 <Route path="/seller/product/new" element={<SellerProductFormPage />} />  */}{/* 판매자 상품 등록 폼 페이지 */}
{/*                 <Route path="/seller/product/edit/:productId" element={<SellerProductFormPage />} />  */}{/* 판매자 상품 편집 폼 페이지 */}
{/*             </Route> */}
{/*              */}{/* 관리자 권한이 있는 사용자만 접근 가능한 페이지들 */}
{/*             <Route element={<PrivateRoute role="admin" />}> */}
{/*               <Route path="/admin" element={<AdminPage />} />  */}{/* 관리자 대시보드 */}
{/*               <Route path="/admin/seller/list" element={<AdminSellerListPage />} />  */}{/* 관리자 판매자 목록 페이지 */}
{/*               <Route path="/admin/seller/:sellerId" element={<AdminSellerDetailPage />} />  */}{/* 관리자 판매자 상세/권한 수정 페이지 */}
{/*             </Route> */}
{/*         </Routes> */}
{/*     </BrowserRouter> */}
    </>
  )
}

export default App
