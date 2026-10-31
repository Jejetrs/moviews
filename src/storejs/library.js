import api, { hasSession, splitKey } from "../utils/api";
import {
  addReview,
  clearWatchlist,
  removeReview,
  resetLibrary,
  setLibrary,
  setRating,
  setTitleReviews,
  toggleWatchlist,
} from "./userSlice";

/*
 * Library actions. The Redux state is updated first so the UI reacts instantly; when the
 * user is signed in the change is also written to the database and rolled back if that fails.
 * Signed-out visitors keep using the local (localStorage) library, as before.
 */

/** Loads the signed-in user's watchlist, ratings and reviews from the database. */
export const loadLibrary = () => async (dispatch) => {
  if (!hasSession()) return;
  const { data } = await api.get("/library");
  dispatch(setLibrary(data));
};

/** After login: merge whatever the visitor collected as a guest into the account, then load it. */
export const syncAfterLogin = () => async (dispatch, getState) => {
  const { watchlist, ratings } = getState().user;
  if (watchlist.length || Object.keys(ratings).length) {
    await api.post("/library/import", { watchlist, ratings });
  }
  await dispatch(loadLibrary());
};

export const clearLibrary = () => (dispatch) => dispatch(resetLibrary());

export const toggleWatchlistItem = (item) => async (dispatch, getState) => {
  const saved = getState().user.watchlist.some((entry) => entry.key === item.key);
  dispatch(toggleWatchlist(item));
  if (!hasSession()) return;
  try {
    const path = `/watchlist/${item.media_type}/${item.id}`;
    if (saved) await api.delete(path);
    else await api.put(path, item);
  } catch (error) {
    dispatch(toggleWatchlist(item)); // roll back
    throw error;
  }
};

export const clearWatchlistItems = () => async (dispatch, getState) => {
  const previous = getState().user.watchlist;
  dispatch(clearWatchlist());
  if (!hasSession()) return;
  try {
    await api.delete("/watchlist");
  } catch (error) {
    dispatch(setLibrary({ ...getState().user, watchlist: previous }));
    throw error;
  }
};

export const rateTitle = (key, value) => async (dispatch, getState) => {
  const previous = getState().user.ratings[key] || 0;
  dispatch(setRating({ key, value }));
  if (!hasSession()) return;
  try {
    const { type, id } = splitKey(key);
    if (value > 0) await api.put(`/ratings/${type}/${id}`, { value });
    else await api.delete(`/ratings/${type}/${id}`);
  } catch (error) {
    dispatch(setRating({ key, value: previous }));
    throw error;
  }
};

/** Community reviews for one title (public: anyone can read them, posting needs an account). */
export const loadReviews = (key) => async (dispatch) => {
  const { type, id } = splitKey(key);
  const { data } = await api.get(`/titles/${type}/${id}/reviews`);
  dispatch(setTitleReviews({ key, reviews: data.reviews }));
};

export const postReview = (key, { rating, text }) => async (dispatch) => {
  const { type, id } = splitKey(key);
  const { data } = await api.post(`/titles/${type}/${id}/reviews`, { rating, text });
  dispatch(addReview({ key, review: data.review }));
  dispatch(setRating({ key, value: rating })); // the server stores the star rating with the review
};

export const deleteReview = (key, id) => async (dispatch) => {
  await api.delete(`/reviews/${id}`);
  dispatch(removeReview({ key, id }));
};
