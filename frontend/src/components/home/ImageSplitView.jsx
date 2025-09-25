import React, { useRef, useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import './ImageSplitView.css';

const ImageSplitView = ({ skewed }) => {
  const parentRef = useRef(null);
  const bottomContentRef = useRef(null);
  const topContentRef = useRef(null);
  const cardRefs = useRef([]);

  const transitionDuration = 500; // ms
  const slideInterval = 4000; // ms

  // (기존 originalCardsData는 생략하고 그대로 사용)
  const originalCardsData = [
    // ... (Your data)
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
    },{
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

    // ... (나머지 9개 데이터도 그대로 유지)
  ];

  const originalLength = originalCardsData.length;
  const cloneCount = 3;
  const cardsData = [
    ...originalCardsData.slice(-cloneCount),
    ...originalCardsData,
    ...originalCardsData.slice(0, cloneCount),
  ];

  const initialIndex = cloneCount; // 첫 번째 원본 카드의 인덱스

  const [activeCardIndex, setActiveCardIndex] = useState(initialIndex);
  // 점프(transition: none) 상태와 슬라이딩 상태를 분리하기 위해 isJumping 사용
  const [isJumping, setIsJumping] = useState(false);


  // **1. 자동 슬라이드 및 무한 루프 점프 처리**
  useEffect(() => {
    // isJumping 중에는 새로운 슬라이드를 시작하지 않음
    if (isJumping) return;

    const interval = setInterval(() => {
      // 다음 인덱스로 이동
      let nextIndex = activeCardIndex + 1;

      // 오른쪽 클론 데이터의 끝에 도달했을 때 (점프 준비)
      if (nextIndex >= initialIndex + originalLength) {
        // 애니메이션 시간만큼 기다린 후 점프하도록 setTimeout 설정
        setTimeout(() => {
          // transition: none 상태가 적용된 다음 프레임에서
          // 인덱스를 첫 번째 원본 카드 위치로 즉시 재설정
          setActiveCardIndex(initialIndex);
          setIsJumping(false);
        }, transitionDuration);

        // 점프를 시작하기 위해 isJumping을 true로 설정 (CSS transition: none 적용)
        setIsJumping(true);
      }

      // 일반적인 슬라이드 진행
      setActiveCardIndex(nextIndex);

    }, slideInterval);

    return () => clearInterval(interval);
  }, [activeCardIndex, originalLength, initialIndex, isJumping]);


  // **2. Mouse move effect for split view (기존 로직 유지)**
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!parentRef.current) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      const isMobile = window.matchMedia("(max-width: 900px)").matches;

      if (isMobile) {
        parentRef.current.style.setProperty('--handle-y', `${clientY}px`);
      } else {
        parentRef.current.style.setProperty('--handle-x', `${clientX}px`);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);


  // **3. 슬라이드 애니메이션 제어 (isJumping 상태 반영)**
  useEffect(() => {
    // 카드가 렌더링되기 전에 실행될 수 있으므로 확인
    const cardWidth = cardRefs.current[initialIndex]?.offsetWidth || 0;
    const gap = 20;
    const offset = -activeCardIndex * (cardWidth + gap);

    const transition = `transform ${transitionDuration}ms ease-in-out`;
    const noTransition = 'none';

    if (bottomContentRef.current && topContentRef.current) {
        // 1. transform 적용
        bottomContentRef.current.style.transform = `translateX(${offset}px)`;
        topContentRef.current.style.transform = `translateX(${offset}px)`;

        // 2. isJumping 상태에 따라 transition 설정
        if (isJumping) {
            // 점프 중일 때는 transition을 제거하여 애니메이션 없이 이동
            bottomContentRef.current.style.transition = noTransition;
            topContentRef.current.style.transition = noTransition;
        } else {
            // 일반 슬라이드 시 애니메이션 적용
            bottomContentRef.current.style.transition = transition;
            topContentRef.current.style.transition = transition;
        }
    }

  }, [activeCardIndex, originalLength, initialIndex, isJumping]);


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