import React from "react";
import { isExpired } from "react-jwt";
import { Outlet } from "react-router";
import auth from "./auth";
import axios from "axios";

function CheckToken(accessToken, refreshToken) {
  var isAccessTokenExpired = isExpired(accessToken);
  var isRefreshTokenExpired = isExpired(refreshToken);
  if (isAccessTokenExpired === false) {
    return true;
  } else if (isRefreshTokenExpired === false) {
    axios
      .post(`${process.env.REACT_APP_SERVER_LINK}/refresh-token`, {
        refreshToken: refreshToken,
      })
      .then((res) => {
        if (res.status === 200) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.setItem("accessToken", res.data["accessToken"]);
          localStorage.setItem("refreshToken", res.data["refreshToken"]);
        }
      });
    return true;
  } else {
    auth.logout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });
  }
}

function PrivateRoute({ Component, ...rest }) {
  const isAuth = auth.isAuthenticated();
  return isAuth ? (
    <Outlet />
  ) : localStorage.accessToken && localStorage.refreshToken ? (
    CheckToken(localStorage.accessToken, localStorage.refreshToken) ? (
      <Outlet />
    ) : (
      <div>
        <p style={{ fontSize: "35px", fontWeight: "900" }}>
          404 <br /> Page not found
        </p>
        <a style={{ fontSize: "20px" }} href="/">
          Go to home
        </a>
      </div>
    )
  ) : (
    <div>
      <p style={{ fontSize: "35px", fontWeight: "900" }}>
        404 <br /> Page not found
      </p>
      <a style={{ fontSize: "20px" }} href="/">
        Go to home
      </a>
    </div>
  );
}

export default PrivateRoute;
