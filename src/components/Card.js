import React from "react";
import { Link } from "react-router-dom";
import { IoStar } from "react-icons/io5";
import { poster, scoreOf, titleOf, typeOf, yearOf } from "../utils/tmdb";
import WatchlistButton from "./WatchlistButton";

const Card = ({ data, media_type, trending, index }) => {
  const type = typeOf(data, media_type);
  const image = poster(data?.poster_path);

  return (
    <div className="poster-card">
      <Link to={`/${type}/${data.id}`} className="poster-link" aria-label={titleOf(data)}>
        <div className="poster-frame">
          {image ? (
            <img src={image} alt={titleOf(data)} loading="lazy" />
          ) : (
            <div className="poster-empty">{titleOf(data)}</div>
          )}
          <span className="poster-score">
            <IoStar /> {scoreOf(data)}
          </span>
          {trending && <span className="poster-rank">{index}</span>}
          <div className="poster-overlay">
            <p>{data.overview || "No description available."}</p>
          </div>
        </div>
        <div className="poster-meta">
          <h3>{titleOf(data)}</h3>
          <p>
            {yearOf(data) || "TBA"} · {type === "tv" ? "TV" : "Movie"}
          </p>
        </div>
      </Link>
      <div className="poster-action">
        <WatchlistButton data={data} type={type} />
      </div>
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="poster-card">
    <div className="poster-frame skeleton" />
    <div className="poster-meta">
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  </div>
);

export default Card;
