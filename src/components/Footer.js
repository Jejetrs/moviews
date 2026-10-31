import React from "react";
import { Link } from "react-router-dom";
import { LuInstagram } from "react-icons/lu";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";

const SOCIALS = [
  { href: "https://www.instagram.com", label: "Instagram", Icon: LuInstagram },
  { href: "https://www.facebook.com", label: "Facebook", Icon: FaFacebook },
  { href: "https://www.twitter.com", label: "X", Icon: FaXTwitter },
  { href: "https://www.tiktok.com", label: "TikTok", Icon: FaTiktok },
];

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-grid">
      <div>
        <p className="footer-brand">
          Movie<b>App</b>
        </p>
        <p className="footer-text">
          Discover trending films and series, keep a personal watchlist, rate what you watch and share honest reviews.
        </p>
        <div className="footer-social">
          {SOCIALS.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              <Icon />
            </a>
          ))}
        </div>
      </div>
      <div>
        <p className="footer-title">Explore</p>
        <Link to="/">Home</Link>
        <Link to="/browse">Browse</Link>
        <Link to="/watchlist">Watchlist</Link>
      </div>
      <div>
        <p className="footer-title">Community</p>
        <Link to="/help-center">Help Center</Link>
        <Link to="/about-us">About Us</Link>
        <Link to="/terms">Terms</Link>
      </div>
    </div>
    <div className="footer-bottom">
      <span>&copy; {new Date().getFullYear()} Moviews. All rights reserved.</span>
      <span>Movie data provided by TMDB. This product is not endorsed or certified by TMDB.</span>
    </div>
  </footer>
);

export default Footer;
