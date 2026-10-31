import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoBookmarksOutline } from "react-icons/io5";
import Card from "../components/Card";
import { useToast } from "../components/ToastProvider";
import { clearWatchlistItems } from "../storejs/library";
import { errorMessage } from "../utils/api";

const SORTS = {
  added: (a, b) => b.addedAt - a.addedAt,
  rating: (a, b) => b.vote_average - a.vote_average,
  title: (a, b) => a.title.localeCompare(b.title),
};

const WatchlistPage = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const watchlist = useSelector((state) => state.user.watchlist);
  const ratings = useSelector((state) => state.user.ratings);
  const [sort, setSort] = useState("added");
  const [type, setType] = useState("all");

  const items = useMemo(
    () => watchlist.filter((item) => type === "all" || item.media_type === type).sort(SORTS[sort]),
    [watchlist, sort, type]
  );

  const clearAll = () => {
    if (window.confirm("Remove every title from your watchlist?")) {
      dispatch(clearWatchlistItems()).then(
        () => toast("Watchlist cleared", "info"),
        (error) => toast(errorMessage(error, "Could not clear your watchlist"), "error")
      );
    }
  };

  return (
    <div className="page-wrap page-pad">
      <div className="page-title">
        <p className="eyebrow">Library</p>
        <h1>My Watchlist</h1>
        <p className="muted">
          {watchlist.length} saved · {Object.keys(ratings).length} rated
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="state-box">
          <IoBookmarksOutline className="state-icon" />
          <p>Your watchlist is empty. Tap the bookmark on any poster to save it here.</p>
          <Link to="/browse" className="btn btn-primary">
            Browse titles
          </Link>
        </div>
      ) : (
        <>
          <div className="filters">
            <div className="seg">
              {[
                ["all", "All"],
                ["movie", "Movies"],
                ["tv", "TV Shows"],
              ].map(([id, label]) => (
                <button key={id} type="button" className={type === id ? "is-active" : ""} onClick={() => setType(id)}>
                  {label}
                </button>
              ))}
            </div>
            <label className="field">
              <span>Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="added">Recently added</option>
                <option value="rating">Highest rated</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
              Clear all
            </button>
          </div>
          <div className="poster-grid">
            {items.map((item) => (
              <Card key={item.key} data={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WatchlistPage;
