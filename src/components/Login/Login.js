import React, { useState, useCallback } from "react";
import "components/Login/Login.scss";
import logo from "UI/logo.svg";
import { Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import auth from "hoc/auth";
import { CircularProgress } from "@mui/material";
import SnackBar from "components/SnackBar/SnackBar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordReset, setPasswordReset] = useState(false);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setsnackbarSeverity] = useState("error");
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

  const submitResetEmail = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        var res = await axios.post(
          `${process.env.REACT_APP_SERVER_LINK}/reset-password`,
          {
            email: email,
          }
        );
        if (res.status === 200) {
          setOpenSnackbar(true);
          setsnackbarSeverity("success");
          setSnackbarMessage(res.data["success"]);
          setLoading(false);
        }
      } catch (err) {
        setOpenSnackbar(true);
        setSnackbarMessage(err.response.data["error"]);
        setLoading(false);
      }
    },
    [email]
  );

  const submitLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        var res = await axios.post(
          `${process.env.REACT_APP_SERVER_LINK}/signin`,
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

  function resetPasswordForm() {
    return (
      <form onSubmit={submitResetEmail}>
        <div>
          <label className="login__content--label">Email</label>
          <input
            type="email"
            name="email"
            required
            className="login__content--input"
            value={email}
            onChange={updateEmail}
            placeholder="Enter your email address..."
          />
        </div>
        <button className="login__content--btn" type="submit">
          {loading ? (
            <CircularProgress size={20} color="secondary" />
          ) : (
            "Send reset link"
          )}
        </button>
        <div className="login__content--link">
          <p
            className="login__content--link-p"
            onClick={() => setPasswordReset(false)}
          >
            Continue with email
          </p>{" "}
          or{" "}
          <Link to="/signup" className="login__content--link-a">
            Signup as a new user
          </Link>
        </div>
      </form>
    );
  }

  function loginForm() {
    return (
      <form onSubmit={submitLogin}>
        <div>
          <label className="login__content--label">Email</label>
          <input
            type="email"
            name="email"
            required
            className="login__content--input"
            value={email}
            onChange={updateEmail}
            placeholder="Enter your email address..."
          />
        </div>
        {email ? (
          <div>
            <label className="login__content--label">Password</label>
            <input
              type="password"
              name="password"
              required
              className="login__content--input"
              value={password}
              onChange={updatePassword}
              placeholder="Enter your password..."
            />
          </div>
        ) : null}
        <button className="login__content--btn" type="submit">
          {loading ? (
            <CircularProgress size={20} color="secondary" />
          ) : (
            "Continue with email"
          )}
        </button>
        <div className="login__content--link">
          <p
            className="login__content--link-p"
            onClick={() => setPasswordReset(true)}
          >
            Forgot Password?
          </p>{" "}
          or{" "}
          <Link to="/signup" className="login__content--link-a">
            Signup as a new user
          </Link>
        </div>
      </form>
    );
  }

  return (
    <div className="login">
      <SnackBar
        setOpenSnackBar={setOpenSnackbar}
        openSnackBar={openSnackbar}
        snackBarSeverity={snackbarSeverity}
        snackBarMessage={snackbarMessage}
      />
      <Link to="/" className="login__logo">
        <img src={logo} alt="logo" />
      </Link>
      <div className="login__content">
        <h1 className="login__content--header">Log in</h1>
        {passwordReset ? resetPasswordForm() : loginForm()}
      </div>
      {localStorage.accessToken ? <Navigate to="/home" /> : null}
    </div>
  );
}
