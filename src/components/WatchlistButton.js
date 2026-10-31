import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { toggleWatchlistItem } from "../storejs/library";
import { errorMessage } from "../utils/api";
import { keyOf, titleOf, toListItem } from "../utils/tmdb";
import { useToast } from "./ToastProvider";

const WatchlistButton = ({ data, type, variant = "icon" }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const key = data ? keyOf(data, type) : "";
  const saved = useSelector((state) => state.user.watchlist.some((item) => item.key === key));

  if (!data) return null;

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(toggleWatchlistItem(toListItem(data, type))).catch((error) =>
      toast(errorMessage(error, "Could not update your watchlist"), "error")
    );
    toast(saved ? `Removed "${titleOf(data)}" from watchlist` : `Added "${titleOf(data)}" to watchlist`, saved ? "info" : "success");
  };

  const Icon = saved ? IoBookmark : IoBookmarkOutline;

  if (variant === "full") {
    return (
      <button type="button" onClick={handleClick} className={`btn ${saved ? "btn-active" : "btn-ghost"}`}>
        <Icon /> {saved ? "In Watchlist" : "Add to Watchlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`icon-btn ${saved ? "is-on" : ""}`}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={saved}
    >
      <Icon />
    </button>
  );
};

export default WatchlistButton;
