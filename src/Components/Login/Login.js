import React, { useState } from "react";
import "./Login.scss";
import logo from "../../UI/logo.svg";
import { Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import auth from "../../hoc/auth";
import { Alert, CircularProgress, Snackbar } from "@mui/material";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordReset, setPasswordReset] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setsnackbarSeverity] = useState("");
  const [loading, setLoading] = useState(false);

  const submitResetEmail = (e) => {
    setLoading(true);
    e.preventDefault();
    axios
      .post(`${process.env.REACT_APP_SERVER_LINK}/reset-password`, {
        email: email,
      })
      .then((res) => {
        if (res.status === 200) {
          setOpen(true);
          setsnackbarSeverity("success");
          setSnackbarMessage(res.data["success"]);
          setLoading(false);
        }
      })
      .catch((err) => {
        setOpen(true);
        setsnackbarSeverity("error");
        setSnackbarMessage(err.response.data["error"]);
        setLoading(false);
      });
  };

  const submitLogin = (e) => {
    setLoading(true);
    e.preventDefault();
    axios
      .post(`${process.env.REACT_APP_SERVER_LINK}/signin`, {
        email: email,
        password: password,
      })
      .then((res) => {
        if (res.status === 200) {
          auth.login(() => {
            localStorage.setItem("accessToken", res.data["accessToken"]);
            localStorage.setItem("refreshToken", res.data["refreshToken"]);
            navigate("/home");
            setLoading(false);
          });
        }
      })
      .catch((err) => {
        setOpen(true);
        setsnackbarSeverity("error");
        setSnackbarMessage(err.response.data["error"]);
        setLoading(false);
      });
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <div className="login">
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
      >
        <Alert
          severity={snackbarSeverity}
          sx={{ width: "30rem", fontSize: "1.4rem" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Link to="/" className="login__logo">
        <img src={logo} alt="logo" />
      </Link>
      <div className="login__content">
        <h1 className="login__content--header">Log in</h1>
        {passwordReset ? (
          <form onSubmit={submitResetEmail}>
            <div>
              <label className="login__content--label">Email</label>
              <input
                type="email"
                name="email"
                required
                className="login__content--input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
        ) : (
          <form onSubmit={submitLogin}>
            <div>
              <label className="login__content--label">Email</label>
              <input
                type="email"
                name="email"
                required
                className="login__content--input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
        )}
      </div>
      {localStorage.accessToken ? <Navigate to="/home" /> : null}
    </div>
  );
}
