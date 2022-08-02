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
  // const [refreshJWT, setRefreshJWT] = useState(false);
  let accessToken = localStorage.accessToken;
  let refreshToken = localStorage.refreshToken;

  // async function CheckToken(accessToken, refreshToken) {
  //   console.log("passing 1");
  //   let isAccessTokenExpired = isExpired(accessToken);
  //   let isRefreshTokenExpired = isExpired(refreshToken);
  //   console.log(isAccessTokenExpired);
  //   if (isAccessTokenExpired === false) {
  //     console.log("passing 2");
  //     setUserAuthenticated(true);
  //     setLoading(false);
  //   } else if (isRefreshTokenExpired === false) {
  //     console.log("passing 3");
  //     const res = await axios.post(
  //       `${process.env.REACT_APP_SERVER_LINK}/refresh-token`,
  //       {
  //         refreshToken: refreshToken,
  //       }
  //     );
  //     console.log(res.status);
  //     if (res.status === 200) {
  //       console.log("passing 4");
  //       localStorage.removeItem("accessToken");
  //       localStorage.removeItem("refreshToken");
  //       localStorage.setItem("accessToken", res.data["access_token"]);
  //       localStorage.setItem("refreshToken", res.data["refresh_token"]);
  //       setUserAuthenticated(true);
  //       setLoading(false);
  //     } else {
  //       auth.logout(() => {
  //         localStorage.removeItem("accessToken");
  //         localStorage.removeItem("refreshToken");
  //       });
  //       setUserAuthenticated(false);
  //       setLoading(false);
  //     }
  //   } else {
  //     setUserAuthenticated(false);
  //     setLoading(false);
  //   }
  // }

  // axios.interceptors.request.use((req) => {
  //   let decodedTime = decodeToken(localStorage.accessToken)["exp"] * 1000;
  //   let currentTime = Date.now();
  //   // console.log(new Date(decodeToken(accessToken)["exp"] * 1000));
  //   // console.log(new Date());
  //   console.log(decodedTime);
  //   console.log(decodedTime - 120000 < currentTime);
  //   console.log(currentTime);
  //   console.log(refreshJWT);
  //   if (decodedTime - 120000 < currentTime) {
  //     console.log("who knows");
  //     setRefreshJWT(true);
  //   }
  //   return req;
  // });

  // axios.interceptors.response.use(async (req) => {
  //   console.log(req);
  //   let isAccessTokenExpired = isExpired(localStorage.accessToken);
  //   console.log(isAccessTokenExpired);
  //   // console.log("passing 1");
  //   // axios.interceptors.response.eject();
  //   if (isAccessTokenExpired === true) {
  //     return axios
  //       .post(`${process.env.REACT_APP_SERVER_LINK}/refresh-token`, {
  //         refreshToken: refreshToken,
  //       })
  //       .then((res) => {
  //         if (res.status === 200) {
  //           localStorage.removeItem("accessToken");
  //           localStorage.removeItem("refreshToken");
  //           localStorage.setItem("accessToken", res.data["access_token"]);
  //           localStorage.setItem("refreshToken", res.data["refresh_token"]);
  //           setUserAuthenticated(true);
  //           setLoading(false);
  //         } else {
  //           auth.logout(() => {
  //             localStorage.removeItem("accessToken");
  //             localStorage.removeItem("refreshToken");
  //           });
  //           setUserAuthenticated(false);
  //           setLoading(false);
  //         }
  //       });
  // console.log("lessgooo");
  // const res = await axios.post(
  // `${process.env.REACT_APP_SERVER_LINK}/refresh-token`,
  // {
  //   refreshToken: refreshToken,
  // }
  // );
  // console.log(res);
  // if (res.status === 200) {
  //   localStorage.removeItem("accessToken");
  //   localStorage.removeItem("refreshToken");
  //   localStorage.setItem("accessToken", res.data["access_token"]);
  //   localStorage.setItem("refreshToken", res.data["refresh_token"]);
  //   setUserAuthenticated(true);
  //   setLoading(false);
  // } else {
  // auth.logout(() => {
  //   localStorage.removeItem("accessToken");
  //   localStorage.removeItem("refreshToken");
  // });
  // setUserAuthenticated(false);
  // setLoading(false);
  // }
  // }
  //  else {
  //   return req;
  // }
  // console.log("passing 2");
  // await CheckToken(accessToken, refreshToken);
  // });

  // useEffect(() => {
  //   async function refreshToken() {
  //     setRefreshJWT(false);
  //     const res = await axios.post(
  //       `${process.env.REACT_APP_SERVER_LINK}/refresh-token`,
  //       {
  //         refreshToken: refreshToken,
  //       }
  //     );
  //     if (res.status === 200) {
  //       console.log(res);
  //       localStorage.removeItem("accessToken");
  //       localStorage.removeItem("refreshToken");
  //       localStorage.setItem("accessToken", res.data["access_token"]);
  //       localStorage.setItem("refreshToken", res.data["refresh_token"]);
  //       setRefreshJWT(false);
  //       setUserAuthenticated(true);
  //     } else {
  //       auth.logout(() => {
  //         localStorage.removeItem("accessToken");
  //         localStorage.removeItem("refreshToken");
  //       });
  //     }
  //   }
  //   return refreshJWT ? refreshToken() : null;
  // }, [refreshJWT]);

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

  useEffect(() => {
    setLoading(true);

    CheckToken(accessToken, refreshToken);
  }, [setLoading, accessToken, refreshToken]);

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
