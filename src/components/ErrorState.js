import React from "react";
import { IoAlertCircleOutline, IoRefresh } from "react-icons/io5";

const ErrorState = ({ message = "Something went wrong while loading data.", onRetry }) => (
  <div className="state-box">
    <IoAlertCircleOutline className="state-icon" />
    <p>{message}</p>
    {onRetry && (
      <button type="button" className="btn btn-ghost" onClick={onRetry}>
        <IoRefresh /> Try again
      </button>
    )}
  </div>
);

export default ErrorState;
