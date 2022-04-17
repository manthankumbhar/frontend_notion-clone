import React, { useCallback } from "react";
import "Components/Sidebar/Sidebar.scss";
import auth from "hoc/auth";
import logo from "UI/arc_logo_full.svg";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    auth.logout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    });
  }, [navigate]);

  return (
    <div className="sidebar">
      <Link to="/" className="sidebar__logo">
        <img src={logo} alt="logo" className="sidebar__logo--icon" />
      </Link>
      <button className="sidebar__btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
