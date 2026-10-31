import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const AuthShell = ({ title, subtitle, children }) => (
  <div className="auth">
    <div className="auth-art" aria-hidden="true">
      <h2>
        Every great night starts with a <span>great pick.</span>
      </h2>
      <p>Track what you want to watch, rate what you loved and read what the community thinks.</p>
    </div>
    <div className="auth-card">
      <Link to="/" className="brand">
        <img src={logo} alt="" width={34} height={34} />
        <span>
          Movi<b>ews</b>
        </span>
      </Link>
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>
      {children}
    </div>
  </div>
);

export default AuthShell;
