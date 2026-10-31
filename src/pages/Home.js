import React, { useState } from "react";
import { useSelector } from "react-redux";
import BannerHome from "../components/BannerHome";
import Genres from "../components/genres";
import HorizontalScroollCard from "../components/HorizontalScroollCard";
import useFetch from "../hooks/useFetch";

const Home = () => {
  const [range, setRange] = useState("week");
  const watchlist = useSelector((state) => state.user.watchlist);
  const trending = useFetch(`/trending/all/${range}`);
  const nowPlaying = useFetch("/movie/now_playing");
  const topRated = useFetch("/movie/top_rated");
  const popularTv = useFetch("/tv/popular");

  const toggle = (
    <div className="seg">
      <button type="button" className={range === "day" ? "is-active" : ""} onClick={() => setRange("day")}>
        Today
      </button>
      <button type="button" className={range === "week" ? "is-active" : ""} onClick={() => setRange("week")}>
        This week
      </button>
    </div>
  );

  return (
    <>
      <BannerHome />
      <div className="page-wrap">
        <HorizontalScroollCard
          data={trending.data.filter((item) => item.media_type !== "person").slice(0, 10)}
          loading={trending.loading}
          heading="Trending Top 10"
          subtitle="What everyone is watching"
          actions={toggle}
          trending
        />
        {watchlist.length > 0 && (
          <HorizontalScroollCard data={watchlist.slice(0, 15)} heading="Your Watchlist" subtitle="Saved for later" to="/watchlist" />
        )}
        <HorizontalScroollCard
          data={nowPlaying.data}
          loading={nowPlaying.loading}
          heading="Now Playing"
          to="/browse?type=movie&sort=date"
          media_type="movie"
        />
        <HorizontalScroollCard
          data={topRated.data}
          loading={topRated.loading}
          heading="Top Rated Movies"
          to="/browse?type=movie&sort=rating"
          media_type="movie"
        />
        <HorizontalScroollCard
          data={popularTv.data}
          loading={popularTv.loading}
          heading="Popular TV Shows"
          to="/browse?type=tv"
          media_type="tv"
        />
        <Genres />
      </div>
    </>
  );
};

export default Home;
