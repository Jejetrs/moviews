import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoChevronDown, IoClose, IoLogOutOutline, IoMenu, IoPersonOutline } from "react-icons/io5";
import logo from "../assets/logo.png";
import SearchBox from "./SearchBox";
import useOutsideClick from "../hooks/useOutsideClick";
import { clearLibrary } from "../storejs/library";
import { resetAuth } from "../storejs/userSlice";
import { clearAuth } from "../utils/storage";
import { useToast } from "./ToastProvider";

const NAV = [
  { label: "Home", to: "/", end: true },
  { label: "Browse", to: "/browse" },
  { label: "Watchlist", to: "/watchlist" },
];

const COMMUNITY = [
  { label: "Help Center", to: "/help-center" },
  { label: "About Us", to: "/about-us" },
  { label: "Terms", to: "/terms" },
];

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const auth = useSelector((state) => state.user.auth);
  const watchCount = useSelector((state) => state.user.watchlist.length);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [community, setCommunity] = useState(false);
  const [account, setAccount] = useState(false);
  const communityRef = useRef(null);
  const accountRef = useRef(null);

  const closeCommunity = useCallback(() => setCommunity(false), []);
  const closeAccount = useCallback(() => setAccount(false), []);
  useOutsideClick(communityRef, closeCommunity);
  useOutsideClick(accountRef, closeAccount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenu(false);
    setCommunity(false);
    setAccount(false);
  }, [location.pathname]);

  const logout = () => {
    clearAuth();
    dispatch(resetAuth());
    dispatch(clearLibrary()); // the next person on this browser must not see this library
    toast("You have been signed out", "info");
    navigate("/login");
  };

  const navLinks = NAV.map((item) => (
    <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
      {item.label}
      {item.to === "/watchlist" && watchCount > 0 && <span className="nav-badge">{watchCount}</span>}
    </NavLink>
  ));

  const communityLinks = COMMUNITY.map((item) => (
    <Link key={item.to} to={item.to}>
      {item.label}
    </Link>
  ));

  return (
    <header className={`site-header ${scrolled || menu ? "is-solid" : ""}`}>
      <div className="site-header-inner">
        <Link to="/" className="brand" aria-label="Moviews home">
          <img src={logo} alt="" width={34} height={34} />
          <span>
            Movi<b>ews</b>
          </span>
        </Link>

        <nav className="nav-desktop" aria-label="Main">
          {navLinks}
          <div className="dropdown" ref={communityRef}>
            <button type="button" className="nav-link" aria-expanded={community} onClick={() => setCommunity((v) => !v)}>
              Community <IoChevronDown className={community ? "flip" : ""} />
            </button>
            {community && <div className="dropdown-panel">{communityLinks}</div>}
          </div>
        </nav>

        <div className="header-search">
          <SearchBox />
        </div>

        <div className="header-actions">
          {auth.isLoggedIn ? (
            <div className="dropdown" ref={accountRef}>
              <button type="button" className="avatar-btn" aria-label="Account menu" aria-expanded={account} onClick={() => setAccount((v) => !v)}>
                {auth.profilePicture ? (
                  <img src={auth.profilePicture} alt="" />
                ) : (
                  <span>{(auth.username || "U").charAt(0).toUpperCase()}</span>
                )}
              </button>
              {account && (
                <div className="dropdown-panel right">
                  <p className="dropdown-user">{auth.username || "Member"}</p>
                  <Link to="/profile">
                    <IoPersonOutline /> Profile
                  </Link>
                  <button type="button" onClick={logout}>
                    <IoLogOutOutline /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}
          <button type="button" className="menu-toggle" aria-label="Toggle menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
            {menu ? <IoClose /> : <IoMenu />}
          </button>
        </div>
      </div>

      {menu && (
        <div className="nav-mobile">
          <div className="mobile-search">
            <SearchBox />
          </div>
          {navLinks}
          <p className="nav-mobile-title">Community</p>
          {communityLinks}
          {auth.isLoggedIn ? (
            <>
              <Link to="/profile">Profile</Link>
              <button type="button" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
