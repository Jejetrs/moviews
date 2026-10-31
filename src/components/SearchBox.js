import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoSearch, IoStar } from "react-icons/io5";
import useDebounce from "../hooks/useDebounce";
import useFetch from "../hooks/useFetch";
import useOutsideClick from "../hooks/useOutsideClick";
import { poster, scoreOf, titleOf, typeOf, yearOf } from "../utils/tmdb";

const SearchBox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const boxRef = useRef(null);
  const [value, setValue] = useState(() =>
    location.pathname === "/search" ? new URLSearchParams(location.search).get("q") || "" : ""
  );
  const [open, setOpen] = useState(false);
  const query = useDebounce(value.trim(), 300);
  const { data, loading } = useFetch(query.length >= 2 ? "/search/multi" : null, { query });
  const results = data.filter((item) => item.media_type !== "person").slice(0, 6);
  const close = useCallback(() => setOpen(false), []);

  useOutsideClick(boxRef, close);

  useEffect(() => {
    setOpen(false);
    if (location.pathname !== "/search") setValue("");
  }, [location.pathname, location.search]);

  const submit = (event) => {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="search" ref={boxRef}>
      <form onSubmit={submit} role="search">
        <IoSearch className="search-icon" />
        <input
          type="search"
          value={value}
          placeholder="Search movies & TV shows"
          aria-label="Search movies and TV shows"
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </form>
      {open && query.length >= 2 && (
        <div className="search-panel">
          {loading && <p className="search-note">Searching…</p>}
          {!loading && results.length === 0 && <p className="search-note">No results for "{query}"</p>}
          {results.map((item) => (
            <Link key={`${item.media_type}-${item.id}`} to={`/${typeOf(item)}/${item.id}`} className="search-item">
              {item.poster_path ? <img src={poster(item.poster_path, "w92")} alt="" /> : <span className="search-thumb" />}
              <span>
                <b>{titleOf(item)}</b>
                <small>
                  {yearOf(item) || "TBA"} · {typeOf(item) === "tv" ? "TV" : "Movie"}
                </small>
              </span>
              <em>
                <IoStar /> {scoreOf(item)}
              </em>
            </Link>
          ))}
          {results.length > 0 && (
            <button type="button" className="search-all" onClick={submit}>
              See all results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
