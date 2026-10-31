const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set to a random string of at least 16 characters.");
  }
  return secret;
}

const signToken = (user) => jwt.sign({ sub: String(user.id) }, getSecret(), { expiresIn: EXPIRES_IN });
const hashPassword = (plain) => bcrypt.hash(plain, 10);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

/** Express middleware: requires `Authorization: Bearer <jwt>` and sets req.userId. */
function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try {
    req.userId = Number(jwt.verify(token, getSecret()).sub);
    next();
  } catch {
    // The app uses this code to sign the user out when the session has expired.
    res.status(401).json({ message: "Please sign in again", code: "TOKEN_INVALID" });
  }
}

module.exports = { signToken, hashPassword, comparePassword, requireAuth };
