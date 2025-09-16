import "./Banner.css";
import { useEffect, useState } from "react";
import axios from "axios"; // axios 라이브러리 import

const Banner = () => {
    const [banner, setBanner] = useState([]);

    useEffect(() => {
        const fetchBannerData = async () => {
            try {
                const response = await axios.get('/api/product/banner');
                if (Array.isArray(response.data)) {
                    setBanner(response.data);
                } else {
                    console.error('API response is not an array:', response.data);
                    setBanner([]);
                }
            } catch (error) {
                console.error('Error fetching banner data:', error);
                setBanner([]);
            }
        };
        fetchBannerData();
    }, []);

    return (
        <div className={"Banner_Container"}>
            {banner.length > 0 ? (
                banner.map((item, index) => (
                    <div className="Banner_Item" key={index}>
                        <h1 key={index}>{item}</h1>
                    </div>
                ))
            ) : (
                <p>배너 로딩 중...</p>
            )}
        </div>
    );
};

export default Banner;