import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="page-wrap page-pad">
    <div className="state-box big">
      <p className="not-found-code">404</p>
      <h1>This scene was cut</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  </div>
);

export default NotFound;
