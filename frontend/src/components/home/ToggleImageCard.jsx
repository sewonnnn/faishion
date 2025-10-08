import React from "react";
import { Card, Button } from "react-bootstrap";
import "./ToggleImageCard.css";

function ToggleImageCard({ item, isToggled }) {
  const imageStyle = {
    position: "absolute",
    inset: 0,
    objectFit: "cover",
    height: "100%",
    width: "100%",
    transition: "opacity 1s ease-in-out",
  };

  return (
    <Card className="text-white rounded-0 w-100 h-100 toggle-card">

      <Card.Img
        src={item.image}
        alt="이미지"
        className="rounded-0"
        style={{ ...imageStyle, opacity : isToggled ? 0 : 1 }}
      />
      {item.aiImage && (
          <Card.Img
            src={item.aiImage}
            alt="AI 이미지"
            className="rounded-0"
            style={{ ...imageStyle, opacity: isToggled ? 1 : 0 }}
          />
      )}

      {/* Card Overlay and Content (remains on top) */}
      <Card.ImgOverlay
        className="d-flex flex-column justify-content-end p-3 card-overlay-content"
      >
        <div className="d-flex justify-content-between align-items-end w-75">
          <div className="text-start me-4" style={{ flex: "1 1 0%", overflow: "hidden" }}>
            <h5 className="mb-2 two-line-truncate fw-bold fs-5" style={{ fontSize: "1rem" }}>
              {item.description}
            </h5>
            <p className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>{item.businessName}</p>
          </div>
        </div>
      </Card.ImgOverlay>
    </Card>
  );
}

export default ToggleImageCard;