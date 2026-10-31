import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  IoCalendarOutline,
  IoPlay,
  IoShareSocialOutline,
  IoStar,
  IoStarOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import CommentsSection from "../components/CommentSection";
import ErrorState from "../components/ErrorState";
import HorizontalScrollCard from "../components/HorizontalScroollCard";
import RatingPopup from "../components/RatingPopup";
import { useToast } from "../components/ToastProvider";
import VideoPlay from "../components/VideoPlay";
import WatchlistButton from "../components/WatchlistButton";
import useFetchDetails from "../hooks/useFetchDetails";
import NotFound from "./NotFound";
import { rateTitle } from "../storejs/library";
import { errorMessage } from "../utils/api";
import { backdrop, money, poster, runtimeOf, scoreOf, titleOf, yearOf } from "../utils/tmdb";

const pickTrailer = (videos = []) => {
  const youtube = videos.filter((video) => video.site === "YouTube");
  return (
    youtube.find((video) => video.type === "Trailer" && video.official) ||
    youtube.find((video) => video.type === "Trailer") ||
    youtube.find((video) => video.type === "Teaser") ||
    youtube[0] ||
    null
  );
};

const Stat = ({ label, children }) => (
  <div className="stat">
    <small>{label}</small>
    <b>{children}</b>
  </div>
);

const DetailsPage = () => {
  const { explore, id } = useParams();
  const valid = explore === "movie" || explore === "tv";
  const dispatch = useDispatch();
  const toast = useToast();
  const castRef = useRef(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const { data, loading, error, reload } = useFetchDetails(valid ? `/${explore}/${id}` : null, {
    append_to_response: "credits,videos,similar,recommendations",
  });

  const itemKey = `${explore}-${id}`;
  const userRating = useSelector((state) => state.user.ratings[itemKey]) || 0;

  useEffect(() => {
    if (data) document.title = `${titleOf(data)} · Moviews`;
    return () => {
      document.title = "Moviews";
    };
  }, [data]);

  if (!valid) return <NotFound />;
  if (error) return <div className="page-wrap page-pad"><ErrorState message="We could not load this title." onRetry={reload} /></div>;
  if (loading || !data) {
    return (
      <div className="details-skeleton">
        <div className="skeleton details-skeleton-hero" />
      </div>
    );
  }

  const trailer = pickTrailer(data.videos?.results);
  const cast = (data.credits?.cast || []).slice(0, 20);
  const crew = data.credits?.crew || [];
  const directors =
    explore === "tv"
      ? (data.created_by || []).map((person) => person.name)
      : crew.filter((person) => person.job === "Director").map((person) => person.name);
  const writers = [...new Set(crew.filter((person) => ["Writer", "Screenplay", "Story"].includes(person.job)).map((person) => person.name))].slice(0, 4);
  const runtime = explore === "tv" ? data.episode_run_time?.[0] : data.runtime;
  const date = data.release_date || data.first_air_date;
  const score = Math.round((data.vote_average || 0) * 10);
  const scrollCast = (direction) => castRef.current?.scrollBy({ left: direction * 520, behavior: "smooth" });

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard", "success");
    } catch {
      toast("Could not copy the link", "error");
    }
  };

  return (
    <>
      <section className="details-hero">
        {data.backdrop_path && <img className="details-backdrop" src={backdrop(data.backdrop_path)} alt="" />}
        <div className="details-shade" />
        <div className="details-inner">
          <div className="details-poster">
            {data.poster_path ? <img src={poster(data.poster_path, "w500")} alt={titleOf(data)} /> : <div className="poster-empty">{titleOf(data)}</div>}
          </div>

          <div className="details-info">
            <div className="hero-tags">
              <span className="pill pill-accent">{explore === "tv" ? "TV Series" : "Movie"}</span>
              {data.status && <span className="pill">{data.status}</span>}
            </div>
            <h1>
              {titleOf(data)} {yearOf(data) && <span className="details-year">({yearOf(data)})</span>}
            </h1>
            {data.tagline && <p className="tagline">{data.tagline}</p>}

            <div className="meta-row">
              {date && (
                <span>
                  <IoCalendarOutline /> {moment(date).format("MMM D, YYYY")}
                </span>
              )}
              {runtime ? (
                <span>
                  <IoTimeOutline /> {runtimeOf(runtime)}
                </span>
              ) : null}
              {data.original_language && <span>{data.original_language.toUpperCase()}</span>}
            </div>

            <div className="genre-links">
              {(data.genres || []).map((genre) => (
                <Link key={genre.id} to={`/browse?type=${explore}&genre=${genre.id}`} className="chip">
                  {genre.name}
                </Link>
              ))}
            </div>

            <p className="details-overview">{data.overview || "No overview available yet."}</p>

            <div className="details-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowTrailer(true)} disabled={!trailer}>
                <IoPlay /> {trailer ? "Play Trailer" : "No Trailer"}
              </button>
              <WatchlistButton data={data} type={explore} variant="full" />
              <button type="button" className="btn btn-ghost" onClick={() => setShowRating(true)}>
                {userRating ? <IoStar className="gold" /> : <IoStarOutline />} {userRating ? `Your rating: ${userRating}/5` : "Rate"}
              </button>
              <button type="button" className="icon-btn" onClick={share} aria-label="Copy link">
                <IoShareSocialOutline />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="page-wrap">
        <section className="stats-panel">
          <div className="score-ring" style={{ "--score": `${score}%` }}>
            <span>{scoreOf(data)}</span>
            <small>TMDB</small>
          </div>
          <div className="stats-grid">
            <Stat label="Votes">{Number(data.vote_count || 0).toLocaleString()}</Stat>
            <Stat label="Director">{directors.length ? directors.join(", ") : "–"}</Stat>
            <Stat label="Writers">{writers.length ? writers.join(", ") : "–"}</Stat>
            {explore === "movie" ? (
              <>
                <Stat label="Budget">{money(data.budget)}</Stat>
                <Stat label="Revenue">{money(data.revenue)}</Stat>
              </>
            ) : (
              <>
                <Stat label="Seasons">{data.number_of_seasons || "–"}</Stat>
                <Stat label="Episodes">{data.number_of_episodes || "–"}</Stat>
              </>
            )}
            <Stat label="Your rating">{userRating ? `${userRating}/5` : "Not rated"}</Stat>
          </div>
        </section>

        {cast.length > 0 && (
          <section className="row-section">
            <div className="section-head">
              <div>
                <h2>Top Cast</h2>
                <p>{cast.length} featured performers</p>
              </div>
              <div className="section-actions">
                <button type="button" className="icon-btn" onClick={() => scrollCast(-1)} aria-label="Scroll cast left">
                  <FaAngleLeft />
                </button>
                <button type="button" className="icon-btn" onClick={() => scrollCast(1)} aria-label="Scroll cast right">
                  <FaAngleRight />
                </button>
              </div>
            </div>
            <div className="cast-track" ref={castRef}>
              {cast.map((person) => (
                <div key={person.credit_id || person.id} className="cast-card">
                  {person.profile_path ? (
                    <img src={poster(person.profile_path, "w185")} alt={person.name} loading="lazy" />
                  ) : (
                    <div className="cast-empty">{person.name.charAt(0)}</div>
                  )}
                  <b>{person.name}</b>
                  <small>{person.character}</small>
                </div>
              ))}
            </div>
          </section>
        )}

        <CommentsSection itemKey={itemKey} />

        <HorizontalScrollCard data={data.similar?.results} heading={`Similar ${explore === "tv" ? "TV Shows" : "Movies"}`} media_type={explore} />
        <HorizontalScrollCard data={data.recommendations?.results} heading="Recommended For You" media_type={explore} />
      </div>

      {showTrailer && <VideoPlay videoKey={trailer?.key} title={titleOf(data)} close={() => setShowTrailer(false)} />}
      {showRating && (
        <RatingPopup
          title={titleOf(data)}
          current={userRating}
          onClose={() => setShowRating(false)}
          onRate={(value) => {
            dispatch(rateTitle(itemKey, value)).then(
              () => toast(value ? `Rated ${value}/5` : "Rating removed", value ? "success" : "info"),
              (error) => toast(errorMessage(error, "Could not save your rating"), "error")
            );
          }}
        />
      )}
    </>
  );
};

export default DetailsPage;
