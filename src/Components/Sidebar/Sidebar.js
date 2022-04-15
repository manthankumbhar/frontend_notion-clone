import React, { useCallback, useState } from "react";
import "Components/Sidebar/Sidebar.scss";
import auth from "hoc/auth";
import logo from "UI/logo.svg";
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
  const optionsDemo = [
    { name: "weekly progress", id: "abc" },
    { name: "cool talks", id: "def" },
    { name: "In the middle of june", id: "ghi" },
  ];
  const [menuOptions, setMenuOptions] = useState(optionsDemo);
  console.log(setMenuOptions);
  // will set it once api starts working
  const sidebarMenuOptions = menuOptions.map((item, key) => {
    return (
      <div
        className="sidebar__menu--options"
        key={key}
        onClick={() => console.log(`backend/document/${item.id} is clicked`)}
        // will convert it to another function and add useCallback
      >
        {item.name}
      </div>
    );
  });

  const SidebarMenu = useCallback(() => {
    return <div>{sidebarMenuOptions}</div>;
  }, [sidebarMenuOptions]);

  return (
    <div className="sidebar">
      <Link to="/" className="sidebar__logo">
        <img src={logo} alt="logo" />
      </Link>
      <div className="sidebar__menu">
        <div className="sidebar__menu--headers">
          <p className="sidebar__menu--headers--title">Documents:</p>
          <button className="sidebar__menu--headers--btn">+</button>
          {/* will set onClick functionalities once api is done */}
        </div>
        <SidebarMenu />
      </div>
      <button className="sidebar__btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
