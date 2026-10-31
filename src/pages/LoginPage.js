import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { setAuth } from "../storejs/userSlice";
import { syncAfterLogin } from "../storejs/library";
import api, { errorMessage } from "../utils/api";
import { writeAuth } from "../utils/storage";
import { useToast } from "../components/ToastProvider";
import AuthShell from "../components/AuthShell";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/login", { email, password });
      const user = data.user || {};
      writeAuth({
        isLoggedIn: "true",
        username: user.username,
        fullname: user.fullname,
        email: user.email || email,
        userId: user.id,
        authToken: data.token,
        profilePicture: user.avatar,
      });
      dispatch(
        setAuth({
          username: user.username || "",
          fullname: user.fullname || "",
          email: user.email || email,
          profilePicture: user.avatar || "",
        })
      );
      // Bring this account's watchlist, ratings and reviews in. A failure here must not block the login.
      await dispatch(syncAfterLogin()).catch(() => toast("Signed in, but your library could not be loaded", "error"));
      toast(`Welcome back, ${user.username || "movie fan"}!`, "success");
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not sign in. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to sync your watchlist, ratings and reviews.">
      <form onSubmit={handleLogin} className="auth-form">
        <label>
          <span>Email address</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
        </label>
        <label>
          <span>Password</span>
          <div className="input-eye">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <p className="auth-switch">
        New to Moviews? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
};

export default LoginPage;
