import React, { useCallback, useEffect, useState } from "react";
import "components/Sidebar/Sidebar.scss";
import auth from "hoc/auth";
import logo from "public/assets/arc_logo_full.svg";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import axios from "axios";
import { CircularProgress } from "@mui/material";

export default function Sidebar({ documentIdArray }) {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    auth.logout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    });
  }, [navigate]);
  const [button, setButton] = useState(false);
  const [menuOptions, setMenuOptions] = useState([]);
  const accessToken = localStorage.accessToken;
  if (accessToken === "" || accessToken === null || accessToken === undefined) {
    navigate("/error");
  }

  useEffect(() => {
    setMenuOptions(documentIdArray);
  }, [documentIdArray]);

  const sidebarMenuOptions = menuOptions.map((item, key) => {
    let url = document.URL;
    let documentId = url.substring(url.lastIndexOf("/") + 1);
    return (
      <Link
        className={
          item.id === documentId
            ? "sidebar__menu--options sidebar__menu--options--active"
            : "sidebar__menu--options"
        }
        key={key}
        to={`/documents/${item.id}`}
      >
        {item.name == null || item.name === ""
          ? `Document ${key + 1}`
          : item.name}
      </Link>
    );
  });

  const renderSidebarMenu = useCallback(() => {
    return <div>{sidebarMenuOptions}</div>;
  }, [sidebarMenuOptions]);

  const newDocBtnOnClick = useCallback(async () => {
    setButton(true);
    try {
      var config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      };
      var res = await axios.post(
        `${process.env.REACT_APP_SERVER_LINK}/documents`,
        {},
        config
      );
      var parsedData = JSON.parse(res.data);
      var id = parsedData["id"];
      navigate(`/documents/${id}`);
      setMenuOptions([...menuOptions, { id: id, name: parsedData["name"] }]);
      return setButton(false);
    } catch (err) {
      setButton(false);
      navigate("/error");
    }
  }, [menuOptions, navigate, accessToken]);

  return (
    <div className="sidebar">
      <Link to="/documents" className="sidebar__logo">
        <img src={logo} alt="logo" className="sidebar__logo--icon" />
      </Link>
      <div
        className="sidebar__menu"
        style={menuOptions.length > 10 ? { overflowY: "scroll" } : null}
      >
        <div className="sidebar__menu--headers">
          <p className="sidebar__menu--headers--title">Documents:</p>
          <button
            className="sidebar__menu--headers--btn"
            onClick={button === true ? null : newDocBtnOnClick}
            style={button === true ? { cursor: "not-allowed" } : null}
          >
            +
          </button>
        </div>
        {menuOptions.length === 0 ? (
          <CircularProgress size={40} color="secondary" />
        ) : (
          renderSidebarMenu()
        )}
      </div>
      <button className="sidebar__btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
