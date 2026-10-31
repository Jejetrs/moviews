import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useToast } from "../components/ToastProvider";
import api, { errorMessage } from "../utils/api";
import AuthShell from "../components/AuthShell";

const RegisterPage = () => {
  const [form, setForm] = useState({ fullname: "", username: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/register", {
        email: form.email,
        password: form.password,
        username: form.username,
        fullname: form.fullname,
      });
      toast(data.message || "Account created", "success");
      navigate("/login");
    } catch (err) {
      setError(errorMessage(err, "Could not create the account. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join to rate titles, write reviews and build your watchlist.">
      <form onSubmit={handleRegister} className="auth-form">
        <div className="auth-two">
          <label>
            <span>Full name</span>
            <input value={form.fullname} onChange={set("fullname")} placeholder="Jane Doe" autoComplete="name" required />
          </label>
          <label>
            <span>Username</span>
            <input value={form.username} onChange={set("username")} placeholder="janedoe" autoComplete="username" required />
          </label>
        </div>
        <label>
          <span>Email address</span>
          <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" required />
        </label>
        <div className="auth-two">
          <label>
            <span>Password</span>
            <div className="input-eye">
              <input type={show ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 6 characters" autoComplete="new-password" required />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </label>
          <label>
            <span>Confirm password</span>
            <input type={show ? "text" : "password"} value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" autoComplete="new-password" required />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? "Creating account…" : "Sign Up"}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
};

export default RegisterPage;
