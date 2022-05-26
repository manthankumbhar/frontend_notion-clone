import React, { useEffect, useState } from "react";
import { isExpired } from "react-jwt";
import { Outlet } from "react-router";
import auth from "hoc/auth";
import axios from "axios";
import Error from "components/Error/Error";
import { CircularProgress } from "@mui/material";

export default function PrivateRoute({ Component, ...rest }) {
  const [loading, setLoading] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  useEffect(() => {
    setLoading(true);
    async function CheckToken(accessToken, refreshToken) {
      var isAccessTokenExpired = isExpired(accessToken);
      var isRefreshTokenExpired = isExpired(refreshToken);
      if (isAccessTokenExpired === false) {
        setUserAuthenticated(true);
        setLoading(false);
      } else if (isRefreshTokenExpired === false) {
        const res = await axios.post(
          `${process.env.REACT_APP_SERVER_LINK}/refresh-token`,
          {
            refreshToken: refreshToken,
          }
        );
        if (res.status === 200) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.setItem("accessToken", res.data["access_token"]);
          localStorage.setItem("refreshToken", res.data["refresh_token"]);
          setUserAuthenticated(true);
          setLoading(false);
        } else {
          auth.logout(() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          });
          setUserAuthenticated(false);
          setLoading(false);
        }
      } else {
        setUserAuthenticated(false);
        setLoading(false);
      }
    }
    CheckToken(localStorage.accessToken, localStorage.refreshToken);
  }, [setLoading]);

  if (loading) {
    return (
      <div className="home__loading">
        <CircularProgress size={40} color="secondary" />
      </div>
    );
  } else {
    if (userAuthenticated) {
      return <Outlet />;
    } else {
      return <Error />;
    }
  }
}
