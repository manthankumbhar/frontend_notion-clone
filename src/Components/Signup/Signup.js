import React, { useCallback, useState } from "react";
import "Components/Signup/Signup.scss";
import logo from "UI/logo.svg";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import auth from "hoc/auth";
import { CircularProgress } from "@mui/material";
import SnackBar from "Components/SnackBar/SnackBar";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const updateEmail = useCallback(
    (e) => {
      setEmail(e.target.value);
    },
    [setEmail]
  );

  const updatePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
    },
    [setPassword]
  );

  const submit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        var res = await axios.post(
          `${process.env.REACT_APP_SERVER_LINK}/signup`,
          {
            email: email,
            password: password,
          }
        );
        if (res.status === 200) {
          auth.login(() => {
            localStorage.setItem("accessToken", res.data["access_token"]);
            localStorage.setItem("refreshToken", res.data["refresh_token"]);
            setLoading(false);
            navigate("/home");
          });
        }
      } catch (err) {
        setOpenSnackbar(true);
        setSnackbarMessage(err.response.data["error"]);
        setLoading(false);
      }
    },
    [email, password, navigate]
  );

  return (
    <div className="signup">
      <SnackBar
        setOpenSnackBar={setOpenSnackbar}
        openSnackBar={openSnackbar}
        snackBarSeverity="error"
        snackBarMessage={snackbarMessage}
      />
      <Link to="/" className="signup__logo">
        <img src={logo} alt="logo" />
      </Link>
      <form className="signup__content" onSubmit={submit}>
        <h1 className="signup__content--header">Sign up</h1>
        <div>
          <label className="signup__content--label">Email</label>
          <input
            type="email"
            name="email"
            required
            className="signup__content--input"
            value={email}
            onChange={updateEmail}
            placeholder="Enter your email address..."
          />
        </div>
        {email ? (
          <div>
            <label className="signup__content--label">Password</label>
            <input
              type="password"
              name="password"
              required
              className="signup__content--input"
              value={password}
              onChange={updatePassword}
              placeholder="Enter your password..."
            />
          </div>
        ) : null}
        <button className="signup__content--btn" type="submit">
          {loading ? (
            <CircularProgress size={20} color="secondary" />
          ) : (
            "Register with email"
          )}
        </button>
        <Link to="/" className="signup__content--link">
          Already a user?
        </Link>
      </form>
      {localStorage.accessToken ? <Navigate to="/home" /> : null}
    </div>
  );
}
