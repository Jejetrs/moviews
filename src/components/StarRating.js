import React, { useState } from "react";
import { IoStar, IoStarOutline } from "react-icons/io5";

const StarRating = ({ value = 0, onChange, size = 22, readOnly }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="stars" role={readOnly ? "img" : "radiogroup"} aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const Icon = shown >= star ? IoStar : IoStarOutline;
        return readOnly ? (
          <Icon key={star} style={{ fontSize: size }} className={shown >= star ? "on" : ""} />
        ) : (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
          >
            <Icon style={{ fontSize: size }} className={shown >= star ? "on" : ""} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
