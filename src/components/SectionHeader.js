import React from "react";
import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";

const SectionHeader = ({ title, subtitle, to, actions }) => (
  <div className="section-head">
    <div>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
    <div className="section-actions">
      {actions}
      {to && (
        <Link to={to} className="see-all">
          See all <IoChevronForward />
        </Link>
      )}
    </div>
  </div>
);

export default SectionHeader;
