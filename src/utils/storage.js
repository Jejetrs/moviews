export const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const AUTH_KEYS = ["isLoggedIn", "username", "fullname", "email", "userId", "authToken", "profilePicture"];

export const readAuth = () => ({
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  username: localStorage.getItem("username") || "",
  fullname: localStorage.getItem("fullname") || "",
  email: localStorage.getItem("email") || "",
  profilePicture: localStorage.getItem("profilePicture") || "",
});

export const writeAuth = (values) => {
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) localStorage.setItem(key, String(value));
  });
};

export const clearAuth = () => AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
