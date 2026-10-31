import React, { useRef } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import Card, { CardSkeleton } from "./Card";
import SectionHeader from "./SectionHeader";

const HorizontalScroollCard = ({ data = [], heading, subtitle, trending, media_type, loading, to, actions }) => {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!loading && (!data || data.length === 0)) return null;

  return (
    <section className="row-section">
      <SectionHeader title={heading} subtitle={subtitle} to={to} actions={actions} />
      <div className="row-wrap">
        <button type="button" className="row-arrow left" onClick={() => scroll(-1)} aria-label="Scroll left">
          <FaAngleLeft />
        </button>
        <div className="row-track" ref={trackRef}>
          {loading && (!data || data.length === 0)
            ? Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)
            : data.map((item, index) => (
                <Card
                  key={`${item.id}-${index}`}
                  data={item}
                  index={index + 1}
                  trending={trending}
                  media_type={media_type}
                />
              ))}
        </div>
        <button type="button" className="row-arrow right" onClick={() => scroll(1)} aria-label="Scroll right">
          <FaAngleRight />
        </button>
      </div>
    </section>
  );
};

export default HorizontalScroollCard;
