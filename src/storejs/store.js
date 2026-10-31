import { configureStore } from "@reduxjs/toolkit";
import movieoReducer from "./movieoSlice";
import userReducer, { LIBRARY_KEY } from "./userSlice";
import { save } from "../utils/storage";

export const store = configureStore({
  reducer: {
    movieoData: movieoReducer,
    user: userReducer,
  },
});

let previous = store.getState().user;

store.subscribe(() => {
  const current = store.getState().user;
  if (
    current.watchlist !== previous.watchlist ||
    current.ratings !== previous.ratings ||
    current.reviews !== previous.reviews
  ) {
    save(LIBRARY_KEY, {
      watchlist: current.watchlist,
      ratings: current.ratings,
      reviews: current.reviews,
    });
  }
  previous = current;
});
