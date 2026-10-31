import React, { useState } from "react";
import useFetch from "../hooks/useFetch";
import useGenres from "../hooks/useGenres";
import HorizontalDoubleScroollCard from "./HorizontalDoubleScroollCard";
import SectionHeader from "./SectionHeader";

const Genres = () => {
  const [selected, setSelected] = useState(28);
  const genres = useGenres("movie");
  const { data: movies, loading } = useFetch("/discover/movie", {
    with_genres: selected,
    sort_by: "popularity.desc",
  });

  return (
    <section className="row-section">
      <SectionHeader
        title="Discover by Genre"
        subtitle="Pick a mood and explore what is popular right now"
        to={`/browse?type=movie&genre=${selected}`}
      />
      <div className="chip-rail">
        {genres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            className={`chip ${selected === genre.id ? "is-active" : ""}`}
            onClick={() => setSelected(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>
      <HorizontalDoubleScroollCard data={movies.slice(0, 10)} loading={loading} media_type="movie" />
    </section>
  );
};

export default Genres;
