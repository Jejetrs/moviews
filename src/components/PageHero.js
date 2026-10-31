import React from "react";

const PageHero = ({ eyebrow, title, subtitle, children }) => (
  <section className="info-hero">
    <div className="info-hero-inner">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {subtitle && <p className="info-sub">{subtitle}</p>}
      {children}
    </div>
  </section>
);

export default PageHero;
