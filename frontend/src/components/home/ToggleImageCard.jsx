import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import "./ToggleImageCard.css";

function ToggleImageCard({item}) {
  const [hover, setHover] = useState(false);
  // Base style for the image elements
  const imageStyle = {
    position: "absolute", // Stack them
    inset: 0, // Cover the entire card
    objectFit: "cover",
    height: "100%",
    width: "100%",
    transition: "opacity 0.4s ease-in-out", // ⭐ Transition added here
  };

  return (
    <Card className="text-white rounded-0 w-100 h-100 toggle-card">

      <Card.Img
        src={item.image}
        alt="이미지"
        className="rounded-0"
        style={{ ...imageStyle, opacity: hover ? 0 : 1 }} // Opacity 1 when NOT hovered
      />
      <Card.Img
        src={item.aiImage}
        alt="AI 이미지"
        className="rounded-0"
        style={{ ...imageStyle, opacity: hover ? 1 : 0 }} // Opacity 1 when hovered
      />

      {/* Card Overlay and Content (remains on top) */}
      <Card.ImgOverlay
        className="d-flex flex-column justify-content-end p-3 card-overlay-content" // Ensure overlay is on top of images
      >
        <div className="d-flex justify-content-between align-items-end w-100">
          <div className="text-start me-4" style={{ flex: "1 1 0%", overflow: "hidden" }}>
            <h5 className="mb-2 two-line-truncate fw-bold fs-5" style={{ fontSize: "1rem" }}>
              {item.description}
            </h5>
            <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>{item.businessName}</p>
          </div>
          <div className="text-end">
            <Button
              variant="dark"
              className="rainbow-btn"
              size="lg"
              // State control remains here
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              AI 미리보기
            </Button>
          </div>
        </div>
      </Card.ImgOverlay>
    </Card>
  );
}

export default ToggleImageCard;