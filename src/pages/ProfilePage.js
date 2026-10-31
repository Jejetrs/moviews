import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HorizontalScroollCard from "../components/HorizontalScroollCard";
import { useToast } from "../components/ToastProvider";
import { setAuth } from "../storejs/userSlice";
import api, { errorMessage } from "../utils/api";
import { writeAuth } from "../utils/storage";

const toAvatar = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const size = 160;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const side = Math.min(img.width, img.height);
        canvas
          .getContext("2d")
          .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);
  const formRef = useRef(null);
  const auth = useSelector((state) => state.user.auth);
  const watchlist = useSelector((state) => state.user.watchlist);
  const ratings = useSelector((state) => state.user.ratings);
  const reviews = useSelector((state) => state.user.reviews);

  const [username, setUsername] = useState(auth.username);
  const [fullname, setFullname] = useState(auth.fullname);
  const [email, setEmail] = useState(auth.email);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!auth.isLoggedIn) {
    return (
      <div className="page-wrap page-pad">
        <div className="state-box big">
          <h1>Sign in to view your profile</h1>
          <p>Your watchlist, ratings and reviews are tied to your account.</p>
          <Link to="/login" state={{ from: "/profile" }} className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const reviewCount = Object.values(reviews).reduce((sum, list) => sum + list.filter((r) => r.user === auth.username).length, 0);
  const stats = [
    { value: watchlist.length, label: "Watchlist" },
    { value: Object.keys(ratings).length, label: "Ratings" },
    { value: reviewCount, label: "Reviews" },
  ];

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const picture = await toAvatar(file);
      await api.post("/edit-profile", { email: auth.email, username: auth.username, fullname: auth.fullname, avatar: picture });
      writeAuth({ profilePicture: picture });
      dispatch(setAuth({ profilePicture: picture }));
      toast("Profile photo updated", "success");
    } catch (error) {
      toast(error.response ? errorMessage(error, "Could not save the photo") : "Could not read that image", "error");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // The API identifies the user from the session token; the response carries a refreshed token.
      const { data } = await api.post("/edit-profile", { email, username, fullname });
      writeAuth({ username, fullname, email, authToken: data.token });
      dispatch(setAuth({ username, fullname, email }));
      toast("Profile updated successfully", "success");
    } catch (error) {
      toast(errorMessage(error, "Failed to update profile"), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast("New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("New password and confirmation do not match", "error");
      return;
    }
    try {
      await api.post("/change-password", { oldPassword, newPassword });
      toast("Password changed successfully", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast(errorMessage(error, "Failed to change password"), "error");
    }
  };

  return (
    <div className="page-wrap page-pad">
      <section className="profile-head">
        <button type="button" className="profile-avatar" onClick={() => fileRef.current?.click()} aria-label="Change profile photo">
          {auth.profilePicture ? <img src={auth.profilePicture} alt="" /> : <span>{(auth.username || "U").charAt(0).toUpperCase()}</span>}
          <em>Change</em>
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
        <div className="profile-id">
          <h1>{auth.username || "Member"}</h1>
          <p className="muted">{auth.fullname || "Full name not set"}</p>
          <p className="muted">{auth.email}</p>
          <div className="profile-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>
              Edit profile
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/watchlist")}>
              Open watchlist
            </button>
          </div>
        </div>
        <div className="profile-stats">
          {stats.map((item) => (
            <div key={item.label}>
              <b>{item.value}</b>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <HorizontalScroollCard data={watchlist.slice(0, 15)} heading="Saved for later" to="/watchlist" />

      <div className="profile-forms" ref={formRef}>
        <form className="panel auth-form" onSubmit={handleSaveProfile}>
          <h2>Profile information</h2>
          <label>
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            <span>Full name</span>
            <input value={fullname} onChange={(e) => setFullname(e.target.value)} required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>

        <form className="panel auth-form" onSubmit={handleChangePassword}>
          <h2>Change password</h2>
          <label>
            <span>Current password</span>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          <label>
            <span>New password</span>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required />
          </label>
          <label>
            <span>Confirm new password</span>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
          </label>
          <button type="submit" className="btn btn-primary">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
