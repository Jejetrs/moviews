import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card, { CardSkeleton } from "../components/Card";
import ErrorState from "../components/ErrorState";
import usePagedFetch from "../hooks/usePagedFetch";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "movie", label: "Movies" },
  { id: "tv", label: "TV Shows" },
];

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const [filter, setFilter] = useState("all");
  const { items, total, loading, more, error, hasMore, loadMore, reload } = usePagedFetch(
    "/search/multi",
    { query },
    Boolean(query)
  );

  const visible = useMemo(
    () => items.filter((item) => item.media_type !== "person" && (filter === "all" || item.media_type === filter)),
    [items, filter]
  );

  return (
    <div className="page-wrap page-pad">
      <div className="page-title">
        <p className="eyebrow">Search</p>
        <h1>{query ? `Results for "${query}"` : "Search movies & TV shows"}</h1>
        {query && !loading && <p className="muted">{total.toLocaleString()} matches found</p>}
      </div>

      {query && (
        <div className="filters-bar">
          <div className="seg">
            {FILTERS.map((item) => (
              <button key={item.id} type="button" className={filter === item.id ? "is-active" : ""} onClick={() => setFilter(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!query && <div className="state-box"><p>Type a title in the search bar above to get started.</p></div>}
      {error && <ErrorState onRetry={reload} />}

      <div className="poster-grid">
        {loading && Array.from({ length: 12 }, (_, i) => <CardSkeleton key={i} />)}
        {visible.map((item) => (
          <Card key={`${item.media_type}-${item.id}`} data={item} />
        ))}
      </div>

      {query && !loading && !error && visible.length === 0 && (
        <div className="state-box">
          <p>No {filter === "all" ? "titles" : filter === "tv" ? "TV shows" : "movies"} found. Try a different keyword.</p>
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

export default SearchPage;
