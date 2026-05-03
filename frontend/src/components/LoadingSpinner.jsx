import React from "react";
import "../styles/global.css";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <p className="spinner-text">{message}</p>
    </div>
  );
}
