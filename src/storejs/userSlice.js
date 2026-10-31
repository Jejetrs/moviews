import { createSlice } from "@reduxjs/toolkit";
import { load, readAuth } from "../utils/storage";

export const LIBRARY_KEY = "movieo:library";

const library = load(LIBRARY_KEY, {});

const initialState = {
  auth: readAuth(),
  watchlist: library.watchlist || [],
  ratings: library.ratings || {},
  reviews: library.reviews || {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.auth = { ...state.auth, ...action.payload, isLoggedIn: true };
    },
    resetAuth: (state) => {
      state.auth = { isLoggedIn: false, username: "", fullname: "", email: "", profilePicture: "" };
    },
    // Replaces the library with what the server returned (own reviews are merged per title).
    setLibrary: (state, action) => {
      const { watchlist, ratings, reviews } = action.payload;
      state.watchlist = watchlist;
      state.ratings = ratings;
      state.reviews = reviews;
    },
    resetLibrary: (state) => {
      state.watchlist = [];
      state.ratings = {};
      state.reviews = {};
    },
    setTitleReviews: (state, action) => {
      state.reviews[action.payload.key] = action.payload.reviews;
    },
    toggleWatchlist: (state, action) => {
      const index = state.watchlist.findIndex((item) => item.key === action.payload.key);
      if (index >= 0) state.watchlist.splice(index, 1);
      else state.watchlist.unshift(action.payload);
    },
    clearWatchlist: (state) => {
      state.watchlist = [];
    },
    setRating: (state, action) => {
      const { key, value } = action.payload;
      if (value > 0) state.ratings[key] = value;
      else delete state.ratings[key];
    },
    addReview: (state, action) => {
      const { key, review } = action.payload;
      state.reviews[key] = [review, ...(state.reviews[key] || [])];
    },
    removeReview: (state, action) => {
      const { key, id } = action.payload;
      state.reviews[key] = (state.reviews[key] || []).filter((review) => review.id !== id);
    },
  },
});

export const {
  setAuth,
  resetAuth,
  setLibrary,
  resetLibrary,
  setTitleReviews,
  toggleWatchlist,
  clearWatchlist,
  setRating,
  addReview,
  removeReview,
} = userSlice.actions;

export default userSlice.reducer;
