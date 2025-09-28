import Banner from "../components/productlist/Banner.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";
import React, {useEffect} from "react";
import ProductListPage from "./ProductListPage.jsx";
import MultiCarousel from '../components/home/MultiCarousel';

const items = [
    {
      id: 1,
      image: 'http://localhost:5173/ex1_1.png',
      aiImage: 'http://localhost:5173/ex1_2.png',
      description: '페이션 패션쇼 컬렉션 2025',
      businessName: '페이션',
    },
{
      id: 2,
      image: 'http://localhost:5173/ex2_1.png',
      aiImage: 'http://localhost:5173/ex2_2.png',
      description: '매일 입고 싶은 데일리 웨어',
      businessName: 'BOOMI',
    }
,{
       id: 3,
       image: 'http://localhost:5173/ex3_1.png',
       aiImage: 'http://localhost:5173/ex3_2.png',
       description: '가을 스트리트 정장룩 100% 할인',
       businessName: 'SEWON',
     },
 {
       id: 4,
       image: 'http://localhost:5173/ex4_1.png',
       aiImage: 'http://localhost:5173/ex4_2.png',
       description: '차분한 명절 한복',
       businessName: '현호네 한복',
     },
 {
       id: 5,
       image: 'http://localhost:5173/ex1_1.png',
       aiImage: 'http://localhost:5173/ex1_2.png',
       description: '페이션 패션쇼 컬렉션 2025',
       businessName: '페이션',
     },
 {
       id: 6,
       image: 'http://localhost:5173/ex2_1.png',
       aiImage: 'http://localhost:5173/ex2_2.png',
       description: '매일 입고 싶은 데일리 웨어',
       businessName: 'BOOMI',
     }
 ,{
        id: 7,
        image: 'http://localhost:5173/ex3_1.png',
        aiImage: 'http://localhost:5173/ex3_2.png',
        description: '가을 스트리트 정장룩 100% 할인',
        businessName: 'SEWON',
      },
  {
        id: 8,
        image: 'http://localhost:5173/ex4_1.png',
        aiImage: 'http://localhost:5173/ex4_2.png',
        description: '차분한 명절 한복',
        businessName: '현호네 한복',
      },
  {
        id: 9,
        image: 'http://localhost:5173/ex1_1.png',
        aiImage: 'http://localhost:5173/ex1_2.png',
        description: '페이션 패션쇼 컬렉션 2025',
        businessName: '페이션',
      },
  {
        id: 10,
        image: 'http://localhost:5173/ex2_1.png',
        aiImage: 'http://localhost:5173/ex2_2.png',
        description: '매일 입고 싶은 데일리 웨어',
        businessName: 'BOOMI',
      }
  ,{
         id: 11,
         image: 'http://localhost:5173/ex3_1.png',
         aiImage: 'http://localhost:5173/ex3_2.png',
         description: '가을 스트리트 정장룩 100% 할인',
         businessName: 'SEWON',
       },
   {
         id: 12,
         image: 'http://localhost:5173/ex4_1.png',
         aiImage: 'http://localhost:5173/ex4_2.png',
         description: '차분한 명절 한복',
         businessName: '현호네 한복',
       },
];

const HomePage = () => {
    return (
        <>
            <MultiCarousel items={items}/>
            <div className="productListPage_Banners">
{/*                 <Banner /> */}
                <ProductListPage/>
            </div>
        </>
    );
}

export default HomePage;