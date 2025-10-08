import React, { useState, useEffect, useCallback } from "react";
import { Carousel } from "react-bootstrap";
import ToggleImageCard from "./ToggleImageCard";
import "./MultiCarousel.css";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

function MultiCarousel({items}) {
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [activeIndex, setActiveIndex] = useState(0);
  // 토글 상태를 관리할 state를 토글된 아이템의 'ID' 대신
  // 현재 슬라이드 내에서 '순차적으로 토글될 아이템의 인덱스'로 변경합니다.
  const [toggledItemIndex, setToggledItemIndex] = useState(-1); // -1: 토글 시작 전, 0부터: 아이템 인덱스

  const updateItems = useCallback(() => {
      const width = window.innerWidth;

      let newItemsPerSlide;
      if (width >= 800) newItemsPerSlide = 3;
      else if (width >= 400) newItemsPerSlide = 2;
      else newItemsPerSlide = 1;

      // 상태가 변경될 때만 업데이트하여 불필요한 렌더링 최소화
      setItemsPerSlide(prev => {
          if (prev !== newItemsPerSlide) {
              setActiveIndex(0); // 아이템 개수 변경 시 첫 슬라이드로 초기화
              setToggledItemIndex(-1); // 토글 인덱스도 초기화
              return newItemsPerSlide;
          }
          return prev;
      });
    }, []);

    // 리사이즈 이벤트에 디바운싱 적용
    useEffect(() => {
      const debouncedUpdateItems = debounce(updateItems, 300);

      debouncedUpdateItems();
      window.addEventListener("resize", debouncedUpdateItems);

      return () => {
        window.removeEventListener("resize", debouncedUpdateItems);
      };
    }, [updateItems]);


  // 슬라이드 묶기
  const slides = [];
  for (let i = 0; i < items.length; i += itemsPerSlide) {
    slides.push(items.slice(i, i + itemsPerSlide));
  }

  const gap = 0;
  const totalGapWidth = (itemsPerSlide - 1) * gap;
  const itemBasis = `calc((100% - ${totalGapWidth}px) / ${itemsPerSlide})`;

  // 토글 및 슬라이드 전환 로직
  useEffect(() => {
    // 현재 활성화된 슬라이드의 아이템 그룹
    const currentGroup = slides[activeIndex];

    if (!currentGroup || currentGroup.length === 0) {
      // 아이템이 없으면 다음 슬라이드로 전환
      setActiveIndex(prev => (prev + 1) % slides.length);
      return;
    }

    // 순차적 토글 진행
    if (toggledItemIndex < currentGroup.length) {
      const delay = 2000; // 토글 간격 (2초)

      const timeoutId = setTimeout(() => {
        setToggledItemIndex(prevIndex => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeoutId); // 클린업

    // 모든 아이템 토글 완료 후 슬라이드 전환
    } else if (toggledItemIndex === currentGroup.length) {
      const delay = 1000; // 마지막 아이템 토글 후 대기 시간 (1초)

      const timeoutId = setTimeout(() => {
        // 다음 슬라이드로 전환
        setActiveIndex(prev => (prev + 1) % slides.length);
        // 다음 슬라이드를 위해 토글 인덱스 초기화
        setToggledItemIndex(-1);
      }, delay);

      return () => clearTimeout(timeoutId); // 클린업
    }

    // activeIndex가 변경되면 (새 슬라이드가 로드되면) 토글 인덱스 초기화
    if (toggledItemIndex !== -1 && activeIndex !== -1) {
        setToggledItemIndex(0);
    }

  }, [activeIndex, toggledItemIndex, slides.length]); // slides.length는 의존성에 포함 (슬라이드 개수 변경 시 재계산)

  return (
      <Carousel
        interval={null}
        activeIndex={activeIndex}
        onSelect={(selectedIndex) => {
            setActiveIndex(selectedIndex);
            setToggledItemIndex(-1);
        }}
        indicators={false}
      >
        {slides.map((group, idx) => {
            // 현재 슬라이드가 아니면 렌더링하지 않거나, 토글 로직을 건너뜁니다.
            const isCurrentSlide = idx === activeIndex;

            return (
              <Carousel.Item key={idx}>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: `${gap}px`,
                    padding: '0 10px'
                }}>
                  {group.map((item, itemIdx) => {
                    // 현재 슬라이드에서 현재 순서의 아이템만 토글합니다.
                    const isToggled = isCurrentSlide && itemIdx === toggledItemIndex;

                    return (
                      <div
                        key={item.id}
                        style={{
                            flexBasis: itemBasis,
                            maxWidth: itemBasis,
                            aspectRatio: "1 / 1",
                          }}
                      >
                      <ToggleImageCard
                          item={item}
                          className="w-100 h-100"
                          isToggled={isToggled}
                      />
                      </div>
                    );
                  })}
                  {Array.from({ length: itemsPerSlide - group.length }).map((_, i) => (
                     <div key={`spacer-${idx}-${i}`} style={{ flexBasis: itemBasis, maxWidth: itemBasis }} />
                  ))}
                </div>
              </Carousel.Item>
            );
        })}
      </Carousel>
  );
}

export default MultiCarousel;