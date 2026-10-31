import React, { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import ToastProvider from "./components/ToastProvider";
import { setBannerData } from "./storejs/movieoSlice";
import { loadLibrary } from "./storejs/library";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get("/trending/all/week")
      .then((response) => dispatch(setBannerData(response.data.results)))
      .catch((error) => console.log("error", error));
  }, [dispatch]);

  // Returning visitors with a saved session get their library from the database.
  useEffect(() => {
    dispatch(loadLibrary()).catch(() => {});
  }, [dispatch]);

  return (
    <ToastProvider>
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
      <ScrollRestoration />
    </ToastProvider>
  );
}

export default App;
