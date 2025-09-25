import React, { useRef, useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import './ImageSplitView.css';

const ImageSplitView = ({ skewed }) => {
  const parentRef = useRef(null);
  const bottomContentRef = useRef(null);
  const topContentRef = useRef(null);
  const cardRefs = useRef([]);

  // 애니메이션 지속 시간 (CSS의 transition duration과 일치해야 함)
  const transitionDuration = 500; // ms

  const originalCardsData = [
    {
        bottom: {
          title: '강아지 1',
          text: '강아지 사진',
          image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        },
        top: {
          title: 'AI 강아지 1',
          text: 'AI 강아지 사진',
          image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          filter: 'hue-rotate(180deg) saturate(200%)',
        }
      },
  {
          bottom: {
            title: '강아지 1',
            text: '강아지 사진',
            image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          },
          top: {
            title: 'AI 강아지 1',
            text: 'AI 강아지 사진',
            image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            filter: 'hue-rotate(180deg) saturate(200%)',
          }
        },
    {
            bottom: {
              title: '강아지 1',
              text: '강아지 사진',
              image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            },
            top: {
              title: 'AI 강아지 1',
              text: 'AI 강아지 사진',
              image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
              filter: 'hue-rotate(180deg) saturate(200%)',
            }
          },
      {
              bottom: {
                title: '강아지 1',
                text: '강아지 사진',
                image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
              },
              top: {
                title: 'AI 강아지 1',
                text: 'AI 강아지 사진',
                image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                filter: 'hue-rotate(180deg) saturate(200%)',
              }
            },
        {
                bottom: {
                  title: '강아지 1',
                  text: '강아지 사진',
                  image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                },
                top: {
                  title: 'AI 강아지 1',
                  text: 'AI 강아지 사진',
                  image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                  filter: 'hue-rotate(180deg) saturate(200%)',
                }
              },
          {
                  bottom: {
                    title: '강아지 1',
                    text: '강아지 사진',
                    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                  },
                  top: {
                    title: 'AI 강아지 1',
                    text: 'AI 강아지 사진',
                    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                    filter: 'hue-rotate(180deg) saturate(200%)',
                  }
                },
            {
                    bottom: {
                      title: '강아지 1',
                      text: '강아지 사진',
                      image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                    },
                    top: {
                      title: 'AI 강아지 1',
                      text: 'AI 강아지 사진',
                      image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                      filter: 'hue-rotate(180deg) saturate(200%)',
                    }
                  },
              {
                      bottom: {
                        title: '강아지 1',
                        text: '강아지 사진',
                        image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                      },
                      top: {
                        title: 'AI 강아지 1',
                        text: 'AI 강아지 사진',
                        image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                        filter: 'hue-rotate(180deg) saturate(200%)',
                      }
                    },
                {
                        bottom: {
                          title: '강아지 1',
                          text: '강아지 사진',
                          image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                        },
                        top: {
                          title: 'AI 강아지 1',
                          text: 'AI 강아지 사진',
                          image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                          filter: 'hue-rotate(180deg) saturate(200%)',
                        }
                      },
                  {
                          bottom: {
                            title: '강아지 1',
                            text: '강아지 사진',
                            image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                          },
                          top: {
                            title: 'AI 강아지 1',
                            text: 'AI 강아지 사진',
                            image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                            filter: 'hue-rotate(180deg) saturate(200%)',
                          }
                        },
  ];

  const originalLength = originalCardsData.length;
  const cloneCount = 3;
  const cardsData = [
    ...originalCardsData.slice(-cloneCount),
    ...originalCardsData,
    ...originalCardsData.slice(0, cloneCount),
  ];

  const initialIndex = cloneCount;

  const [activeCardIndex, setActiveCardIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-slide effect
  useEffect(() => {
    if (isTransitioning) return;

    const interval = setInterval(() => {
      setActiveCardIndex((current) => current + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [isTransitioning]);

  // **복원된 로직: Mouse move effect for split view**
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!parentRef.current) return;

      const clientX = event.clientX;
      const clientY = event.clientY;
      // 900px을 모바일/데스크톱 경계로 가정
      const isMobile = window.matchMedia("(max-width: 900px)").matches;

      if (isMobile) {
        // 모바일에서는 수직(Y) 축으로 분할 효과 (터치 위치 기준)
        parentRef.current.style.setProperty('--handle-y', `${clientY}px`);
      } else {
        // 데스크톱에서는 수평(X) 축으로 분할 효과 (마우스 위치 기준)
        parentRef.current.style.setProperty('--handle-x', `${clientX}px`);
      }
    };

    // document에 이벤트 리스너를 등록합니다.
    document.addEventListener('mousemove', handleMouseMove);

    // 컴포넌트 언마운트 시 클린업
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // 의존성 배열이 비어있어 한 번만 실행됩니다.


  // transitionend 이벤트 리스너를 사용하여 자연스러운 점프 처리
  useEffect(() => {
    const bottomElement = bottomContentRef.current;

    const needsJump = (activeCardIndex >= initialIndex + originalLength) || (activeCardIndex < initialIndex);

    const handleTransitionEnd = () => {
      if (needsJump) {
        let newIndex;
        if (activeCardIndex >= initialIndex + originalLength) {
            newIndex = initialIndex;
        } else if (activeCardIndex < initialIndex) {
            newIndex = initialIndex + originalLength - 1;
        }
        // transitionend 이벤트 내에서는 상태 업데이트가 안전합니다.
        if (newIndex !== undefined) {
             setActiveCardIndex(newIndex);
        }
        setIsTransitioning(false);
      }
    };

    if (bottomElement) {
        bottomElement.addEventListener('transitionend', handleTransitionEnd);
    }

    return () => {
        if (bottomElement) {
            bottomElement.removeEventListener('transitionend', handleTransitionEnd);
        }
    };
  }, [activeCardIndex, initialIndex, originalLength]);


  // Sync the transforms of both card containers (슬라이드 애니메이션 제어)
  useEffect(() => {
    const cardWidth = cardRefs.current[initialIndex]?.offsetWidth || 0;
    const gap = 20;
    const offset = -activeCardIndex * (cardWidth + gap);

    const needsJump = (activeCardIndex >= initialIndex + originalLength) || (activeCardIndex < initialIndex);
    const transition = `transform ${transitionDuration}ms ease-in-out`;
    const noTransition = 'none';

    if (bottomContentRef.current && topContentRef.current) {
        // 1. transform 적용
        bottomContentRef.current.style.transform = `translateX(${offset}px)`;
        topContentRef.current.style.transform = `translateX(${offset}px)`;

        // 2. transition 설정
        if (needsJump) {
            bottomContentRef.current.style.transition = noTransition;
            topContentRef.current.style.transition = noTransition;
            setIsTransitioning(true);
        } else {
            bottomContentRef.current.style.transition = transition;
            topContentRef.current.style.transition = transition;
            setIsTransitioning(false);
        }
    }

  }, [activeCardIndex, originalLength, initialIndex]);

  const splitViewClass = `splitview ${skewed ? 'skewed' : ''}`;

  return (
    <div className={splitViewClass} ref={parentRef}>
      {/* Panel Bottom 및 Top 렌더링 코드는 변경 없이 유지 */}
      <div className="panel bottom">
        <div className="content">
          <div className="card-container" ref={bottomContentRef}>
            {cardsData.map((data, index) => (
              <Card
                key={`bottom-${index}`}
                className="split-card"
                ref={el => cardRefs.current[index] = el}
              >
                <Card.Img variant="top" src={data.bottom.image} />
                <Card.Body>
                  <Card.Title>{data.bottom.title}</Card.Title>
                  <Card.Text>{data.bottom.text}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="panel top">
        <div className="content">
          <div className="card-container" ref={topContentRef}>
            {cardsData.map((data, index) => (
              <Card
                key={`top-${index}`}
                className="split-card"
              >
                <Card.Img
                  variant="top"
                  src={data.top.image}
                  style={{ filter: data.top.filter }}
                />
                <Card.Body>
                  <Card.Title>{data.top.title}</Card.Title>
                  <Card.Text>{data.top.text}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSplitView;