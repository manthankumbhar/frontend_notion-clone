import React, { useState } from "react";
import "./Signup.scss";
import logo from "../../UI/logo.svg";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import auth from "../../hoc/auth";
import { Alert, CircularProgress, Snackbar } from "@mui/material";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    setLoading(true);
    e.preventDefault();
    axios
      .post(`${process.env.REACT_APP_SERVER_LINK}/signup`, {
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
        setOpenSnackbar(true);
        setSnackbarMessage(err.response.data["error"]);
        setLoading(false);
      });
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="signup">
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        openSnackbar={openSnackbar}
        autoHideDuration={4000}
        onClose={handleClose}
      >
        <Alert severity="error" sx={{ width: "30rem", fontSize: "1.4rem" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
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
            onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
