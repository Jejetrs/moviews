import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { IoPlay, IoStar } from "react-icons/io5";
import WatchlistButton from "./WatchlistButton";
import { backdrop, scoreOf, titleOf, typeOf, yearOf } from "../utils/tmdb";

const BannerHome = () => {
  const bannerData = useSelector((state) => state.movieoData.bannerData);
  const slides = bannerData.filter((item) => item.backdrop_path && item.media_type !== "person").slice(0, 6);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return undefined;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return <div className="hero hero-skeleton skeleton" />;

  const go = (index) => setCurrent((index + slides.length) % slides.length);

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel">
      {slides.map((item, index) => (
        <div key={`${item.id}-${index}`} className={`hero-slide ${index === current ? "is-active" : ""}`} aria-hidden={index !== current}>
          <img src={backdrop(item.backdrop_path)} alt="" loading={index === 0 ? "eager" : "lazy"} />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="hero-tags">
              <span className="pill pill-accent">Trending</span>
              <span className="pill">{typeOf(item) === "tv" ? "TV Series" : "Movie"}</span>
              {yearOf(item) && <span className="pill">{yearOf(item)}</span>}
              <span className="pill pill-gold">
                <IoStar /> {scoreOf(item)}
              </span>
            </div>
            <h1>{titleOf(item)}</h1>
            <p>{item.overview}</p>
            <div className="hero-actions">
              <Link to={`/${typeOf(item)}/${item.id}`} className="btn btn-primary btn-lg">
                <IoPlay /> Review Now
              </Link>
              <WatchlistButton data={item} variant="full" />
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="hero-arrow left" onClick={() => go(current - 1)} aria-label="Previous slide">
        <FaAngleLeft />
      </button>
      <button type="button" className="hero-arrow right" onClick={() => go(current + 1)} aria-label="Next slide">
        <FaAngleRight />
      </button>
      <div className="hero-dots">
        {slides.map((item, index) => (
          <button
            key={`dot-${item.id}-${index}`}
            type="button"
            className={index === current ? "is-active" : ""}
            onClick={() => go(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default BannerHome;
