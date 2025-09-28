import React, { useState, useEffect } from "react";
import { Carousel, Card, Container } from "react-bootstrap";
import ToggleImageCard from "./ToggleImageCard";
import "./MultiCarousel.css";


function MultiCarousel({items}) {
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const updateItems = () => {
      const width = window.innerWidth;
      if (width >= 1200) setItemsPerSlide(4);
      else if (width >= 800) setItemsPerSlide(3);
      else if (width >= 400) setItemsPerSlide(2);
      else setItemsPerSlide(1);
      setActiveIndex(0);
    };

    updateItems();
    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, []);

  // 슬라이드 묶기
  const slides = [];
  for (let i = 0; i < items.length; i += itemsPerSlide) {
    slides.push(items.slice(i, i + itemsPerSlide));
  }

  return (
      <Carousel
        interval={3000}
        activeIndex={activeIndex}
        onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
        indicators={false}
      >
        {slides.map((group, idx) => (
          <Carousel.Item key={idx}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {group.map((item) => (
                <div
                  key={item.id}
                  style={{
                      flex: `0 0 calc(100% / ${itemsPerSlide})`,
                      aspectRatio: "1 / 1",
                      display: "flex",
                      height: "100%",
                    }}
                >
                <ToggleImageCard className="w-100 h-100" item={item} />
                </div>
              ))}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

  );
}

export default MultiCarousel;
