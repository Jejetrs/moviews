import axios from "axios";
import { clearAuth } from "./storage";

/**
 * Client for the Moviews API (the Express service that talks to Neon PostgreSQL).
 * It is a separate axios instance on purpose: the global axios defaults point at TMDB
 * and carry the TMDB token, which must never be sent to our own API.
 */
export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:3001").replace(/\/$/, "");

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  config.headers = config.headers || {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // The session expired (or the token is no longer valid): sign out and ask to log in again.
    if (error.response?.data?.code === "TOKEN_INVALID" && localStorage.getItem("authToken")) {
      clearAuth();
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

export const hasSession = () => localStorage.getItem("isLoggedIn") === "true" && !!localStorage.getItem("authToken");

export const errorMessage = (error, fallback) =>
  error?.response?.data?.message || (error?.request ? "Could not reach the server. Please try again." : fallback);

/** "movie-603" -> { type: "movie", id: "603" } */
export const splitKey = (key) => {
  const index = key.indexOf("-");
  return { type: key.slice(0, index), id: key.slice(index + 1) };
};

export default api;
