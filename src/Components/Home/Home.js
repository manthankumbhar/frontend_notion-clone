import React, { useCallback } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import auth from "hoc/auth";
import logo from "UI/logo.svg";
import "Components/Home/Home.scss";
import SlateEditor from "Components/SlateEditor/SlateEditor";

export default function Home() {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    auth.logout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    });
  }, [navigate]);

  return (
    <div className="home">
      <Link to="/" className="login__logo">
        <img src={logo} alt="logo" />
      </Link>
      <SlateEditor />
      <button className="home__btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
