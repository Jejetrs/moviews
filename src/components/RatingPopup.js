import React, { useEffect, useState } from "react";
import StarRating from "./StarRating";

const LABELS = ["", "Terrible", "Poor", "Decent", "Great", "Masterpiece"];

const RatingPopup = ({ title, current = 0, onClose, onRate }) => {
  const [rating, setRating] = useState(current);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Rate this title" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow">Your rating</p>
        <h3>{title}</h3>
        <div className="rate-stars">
          <StarRating value={rating} onChange={setRating} size={40} />
        </div>
        <p className="rate-label">{LABELS[rating] || "Tap a star to rate"}</p>
        <div className="modal-actions">
          {current > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => { onRate(0); onClose(); }}>
              Remove
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!rating}
            onClick={() => { onRate(rating); onClose(); }}
          >
            Save rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingPopup;
