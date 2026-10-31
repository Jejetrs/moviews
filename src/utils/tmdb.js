const IMG = "https://image.tmdb.org/t/p";

export const poster = (path, size = "w500") => (path ? `${IMG}/${size}${path}` : null);
export const backdrop = (path, size = "w1280") => (path ? `${IMG}/${size}${path}` : null);
export const titleOf = (d) => d?.title || d?.name || "Untitled";
export const typeOf = (d, fallback) => d?.media_type || fallback || (d?.title ? "movie" : d?.name ? "tv" : "movie");
export const keyOf = (d, fallback) => `${typeOf(d, fallback)}-${d?.id}`;

export const yearOf = (d) => {
  const value = d?.release_date || d?.first_air_date;
  return value ? value.slice(0, 4) : "";
};

export const scoreOf = (d) => (d?.vote_average ? Number(d.vote_average).toFixed(1) : "–");

export const runtimeOf = (minutes) => {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

export const money = (value) => (value ? `$${Number(value).toLocaleString("en-US")}` : "–");

export const toListItem = (d, fallbackType) => ({
  key: keyOf(d, fallbackType),
  id: d.id,
  media_type: typeOf(d, fallbackType),
  title: titleOf(d),
  poster_path: d.poster_path || null,
  vote_average: d.vote_average || 0,
  release_date: d.release_date || d.first_air_date || "",
  overview: d.overview || "",
  addedAt: Date.now(),
});
