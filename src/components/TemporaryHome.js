import React from "react";
import { Link } from "react-router-dom";
import logo from "public/assets/arc_logo_full.svg";

export default function TemporaryHome() {
  return (
    <div className="login">
      <Link to="/" className="login__logo">
        <img src={logo} alt="logo" />
      </Link>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "70vh",
          alignItems: "center",
          margin: "auto",
        }}
      >
        <h1
          style={{
            margin: "2rem",
          }}
        >
          Sorry, we're facing some technical issues with Heroku, we'll be up and
          running soon. Till then you can check our demo @{" "}
          <a href="https://bit.ly/3ahkG4r" target="_blank" rel="noreferrer">
            here
          </a>
        </h1>
      </div>
    </div>
  );
}
