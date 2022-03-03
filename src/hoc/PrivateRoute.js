import React from "react";
import { isExpired } from "react-jwt";
import { Outlet } from "react-router";
import auth from "hoc/auth";
import axios from "axios";
import Error from "Components/Error/Error";

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
          localStorage.setItem("accessToken", res.data["access-token"]);
          localStorage.setItem("refreshToken", res.data["refresh-token"]);
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
  if (isAuth) {
    return <Outlet />;
  } else if (localStorage.accessToken && localStorage.refreshToken) {
    if (CheckToken(localStorage.accessToken, localStorage.refreshToken)) {
      return <Outlet />;
    } else {
      return <Error />;
    }
  } else {
    return <Error />;
  }
}

export default PrivateRoute;
