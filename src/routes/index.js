import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import DetailsPage from "../pages/DetailsPage";
import SearchPage from "../pages/SearchPage";
import BrowsePage from "../pages/BrowsePage";
import WatchlistPage from "../pages/WatchlistPage";
import HelpCenter from "../pages/HelpCenter";
import Terms from "../pages/Terms";
import AboutUs from "../pages/AboutUs";
import ProfilePage from "../pages/ProfilePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFound from "../pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "browse", element: <BrowsePage /> },
      { path: "watchlist", element: <WatchlistPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "help-center", element: <HelpCenter /> },
      { path: "terms", element: <Terms /> },
      { path: "about-us", element: <AboutUs /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: ":explore/:id", element: <DetailsPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
