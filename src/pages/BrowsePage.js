import React from "react";
import { useSearchParams } from "react-router-dom";
import Card, { CardSkeleton } from "../components/Card";
import ErrorState from "../components/ErrorState";
import useGenres from "../hooks/useGenres";
import usePagedFetch from "../hooks/usePagedFetch";

const SORTS = [
  { id: "popularity", label: "Most popular" },
  { id: "rating", label: "Highest rated" },
  { id: "date", label: "Newest" },
];

const RATINGS = [0, 5, 6, 7, 8];

const BrowsePage = () => {
  const [params, setParams] = useSearchParams();
  const type = params.get("type") === "tv" ? "tv" : "movie";
  const genre = params.get("genre") || "";
  const sort = SORTS.some((item) => item.id === params.get("sort")) ? params.get("sort") : "popularity";
  const rating = Number(params.get("rating")) || 0;
  const year = params.get("year") || "";
  const genres = useGenres(type);

  const today = new Date().toISOString().slice(0, 10);
  const dateField = type === "movie" ? "primary_release_date" : "first_air_date";
  const query = {
    sort_by: sort === "rating" ? "vote_average.desc" : sort === "date" ? `${dateField}.desc` : "popularity.desc",
    ...(genre && { with_genres: genre }),
    ...(rating && { "vote_average.gte": rating }),
    ...(sort === "rating" && { "vote_count.gte": 300 }),
    ...(sort === "date" && { [`${dateField}.lte`]: today, "vote_count.gte": 10 }),
    ...(/^\d{4}$/.test(year) && { [type === "movie" ? "primary_release_year" : "first_air_date_year"]: year }),
  };

  const { items, total, loading, more, error, hasMore, loadMore, reload } = usePagedFetch(`/discover/${type}`, query);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParams(next, { replace: true });
  };

  const activeGenre = genres.find((item) => String(item.id) === genre);
  const hasFilters = genre || rating || year || sort !== "popularity";

  return (
    <div className="page-wrap page-pad">
      <div className="page-title">
        <p className="eyebrow">Browse</p>
        <h1>{activeGenre ? `${activeGenre.name} ${type === "tv" ? "TV Shows" : "Movies"}` : type === "tv" ? "TV Shows" : "Movies"}</h1>
        {!loading && <p className="muted">{total.toLocaleString()} titles</p>}
      </div>

      <div className="filters">
        <div className="seg">
          <button type="button" className={type === "movie" ? "is-active" : ""} onClick={() => update({ type: "", genre: "", year: "" })}>
            Movies
          </button>
          <button type="button" className={type === "tv" ? "is-active" : ""} onClick={() => update({ type: "tv", genre: "", year: "" })}>
            TV Shows
          </button>
        </div>

        <label className="field">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => update({ sort: e.target.value === "popularity" ? "" : e.target.value })}>
            {SORTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Min rating</span>
          <select value={rating} onChange={(e) => update({ rating: e.target.value === "0" ? "" : e.target.value })}>
            {RATINGS.map((value) => (
              <option key={value} value={value}>
                {value ? `${value}+` : "Any"}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Year</span>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            placeholder="Any"
            value={year}
            onChange={(e) => update({ year: e.target.value })}
          />
        </label>

        {hasFilters && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => update({ genre: "", sort: "", rating: "", year: "" })}>
            Reset
          </button>
        )}
      </div>

      <div className="chip-rail wrap">
        <button type="button" className={`chip ${!genre ? "is-active" : ""}`} onClick={() => update({ genre: "" })}>
          All genres
        </button>
        {genres.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip ${String(item.id) === genre ? "is-active" : ""}`}
            onClick={() => update({ genre: String(item.id) })}
          >
            {item.name}
          </button>
        ))}
      </div>

      {error && <ErrorState onRetry={reload} />}

      <div className="poster-grid">
        {loading && Array.from({ length: 12 }, (_, i) => <CardSkeleton key={i} />)}
        {items.map((item) => (
          <Card key={item.id} data={item} media_type={type} />
        ))}
      </div>

      {!loading && !error && items.length === 0 && (
        <div className="state-box">
          <p>Nothing matches these filters. Try loosening them.</p>
        </div>
      )}

      {hasMore && (
        <div className="load-more">
          <button type="button" className="btn btn-ghost" onClick={loadMore} disabled={more}>
            {more ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
