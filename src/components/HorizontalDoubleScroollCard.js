import React from "react";
import Card, { CardSkeleton } from "./Card";
import SectionHeader from "./SectionHeader";

const HorizontalDoubleScroollCard = ({ data = [], heading, loading, to, media_type }) => (
  <section className="row-section">
    {heading && <SectionHeader title={heading} to={to} />}
    <div className="poster-grid">
      {loading
        ? Array.from({ length: 10 }, (_, i) => <CardSkeleton key={i} />)
        : data.map((item) => <Card key={`${item.id}-${item.media_type || ""}`} data={item} media_type={media_type} />)}
    </div>
  </section>
);

export default HorizontalDoubleScroollCard;
