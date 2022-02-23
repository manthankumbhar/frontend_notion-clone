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
      .post("https://backend-notion-clone.herokuapp.com/refresh-tokens", {
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
      <p style={{ fontSize: "35px", fontWeight: "900" }}>
        404 <br /> Page not found
      </p>
    )
  ) : (
    <p style={{ fontSize: "35px", fontWeight: "900" }}>
      404 <br /> Page not found
    </p>
  );
}

export default PrivateRoute;
