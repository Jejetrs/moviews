import axios from "axios";
import { useEffect, useState } from "react";

const cache = {};

const useGenres = (type = "movie") => {
  const [genres, setGenres] = useState(cache[type] || []);

  useEffect(() => {
    if (cache[type]) {
      setGenres(cache[type]);
      return undefined;
    }
    let active = true;
    axios
      .get(`/genre/${type}/list`)
      .then((response) => {
        cache[type] = response.data.genres || [];
        if (active) setGenres(cache[type]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [type]);

  return genres;
};

export default useGenres;
