import React, { useCallback, useEffect, useState } from "react";
import "components/Sidebar/Sidebar.scss";
import auth from "hoc/auth";
import logo from "UI/logo.svg";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Sidebar({ documentIdArray }) {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    auth.logout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    });
  }, [navigate]);
  const [menuOptions, setMenuOptions] = useState([]);
  const accessToken = localStorage.accessToken;
  if (accessToken === "" || accessToken === null || accessToken === undefined) {
    navigate("/error");
  }

  useEffect(() => {
    setMenuOptions(documentIdArray);
  }, [documentIdArray]);

  const sidebarOnClick = useCallback(
    (item) => {
      navigate(`/documents/${item.id}`);
    },
    [navigate]
  );

  const sidebarMenuOptions = menuOptions.map((item, key) => {
    var url = document.URL;
    var documentId = url.substring(url.lastIndexOf("/") + 1);
    return (
      <div
        className={
          item.id === documentId
            ? "sidebar__menu--options sidebar__menu--options--active"
            : "sidebar__menu--options"
        }
        key={key}
        onClick={() => sidebarOnClick(item)}
      >
        {item.name == null ? `Document ${key + 1}` : null}
      </div>
    );
  });

  const renderSidebarMenu = useCallback(() => {
    return <div>{sidebarMenuOptions}</div>;
  }, [sidebarMenuOptions]);

  const newDocBtnOnClick = useCallback(async () => {
    console.log("btn clicked");
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
      setMenuOptions([...menuOptions, { id: id, name: parsedData["name"] }]);
      navigate(`/documents/${id}`);
      return res.data;
    } catch (err) {
      navigate("/error");
    }
  }, [menuOptions, navigate, accessToken]);

  return (
    <div className="sidebar">
      <Link to="/documents" className="sidebar__logo">
        <img src={logo} alt="logo" />
      </Link>
      <div
        className="sidebar__menu"
        style={menuOptions.length > 10 ? { overflowY: "scroll" } : null}
      >
        <div className="sidebar__menu--headers">
          <p className="sidebar__menu--headers--title">Documents:</p>
          <button
            className="sidebar__menu--headers--btn"
            onClick={newDocBtnOnClick}
          >
            +
          </button>
        </div>
        {renderSidebarMenu()}
      </div>
      <button className="sidebar__btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
