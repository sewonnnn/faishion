import React from "react";
import "./CartPage.css";

const CartPage = () => {
    return (
        <div className="cart-container">
            <div className="cart-item">
                {[1,2].map((p)=>(
                    <div key={p} className="cart-item">
                        <img src="https://image.msscdn.net/thumbnails/images/goods_img/20250528/5151434/5151434_17562621557732_big.jpg?w=1200" class="sc-uxvjgl-8 hlFFlu"
                             alt="상품"/>
                        <div className="cart-item-details">


                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default CartPage;