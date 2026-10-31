/**
 * Request-level business rules, independent of Express.
 * Each method returns `{ status, body }`; routes only translate that into a response.
 */
const MEDIA_TYPES = ["movie", "tv"];
const REVIEW_MAX = 600;
const AVATAR_MAX = 300000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ok = (body = {}, status = 200) => ({ status, body });
const fail = (status, message, extra = {}) => ({ status, body: { message, ...extra } });

const text = (value) => (typeof value === "string" ? value.trim() : "");

function parseTitle(mediaType, id) {
  const tmdbId = Number(id);
  if (!MEDIA_TYPES.includes(mediaType) || !Number.isSafeInteger(tmdbId) || tmdbId <= 0) return null;
  return { mediaType, tmdbId };
}

/** Normalises an item sent by the app; returns null when it is unusable. */
function parseWatchlistItem(raw) {
  const title = parseTitle(raw?.media_type, raw?.id);
  const name = text(raw?.title);
  if (!title || !name) return null;
  const vote = Number(raw.vote_average);
  const date = text(raw.release_date);
  return {
    media_type: title.mediaType,
    id: title.tmdbId,
    title: name.slice(0, 500),
    poster_path: typeof raw.poster_path === "string" ? raw.poster_path.slice(0, 255) : null,
    vote_average: Number.isFinite(vote) ? Math.min(10, Math.max(0, Math.round(vote * 10) / 10)) : 0,
    release_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    overview: typeof raw.overview === "string" ? raw.overview : "",
  };
}

const isUnique = (err, name) => err?.code === "23505" && (!name || String(err.constraint || err.message).includes(name));

function createService({ repo, db, hashPassword, comparePassword, signToken }) {
  const session = (user) => ({ user, token: signToken(user) });

  return {
    async health() {
      await db.query("SELECT 1");
      return ok({ status: "ok" });
    },

    // ----- accounts -------------------------------------------------------
    async register({ email, password, username, fullname } = {}) {
      const data = { email: text(email).toLowerCase(), username: text(username), fullname: text(fullname) };
      if (!data.email || !password || !data.username || !data.fullname) return fail(400, "All fields are required");
      if (!EMAIL_RE.test(data.email)) return fail(400, "Please enter a valid email address");
      if (String(password).length < 6) return fail(400, "Password must be at least 6 characters");
      try {
        const user = await repo.createUser(db, { ...data, password: await hashPassword(String(password)) });
        return ok({ message: "User registered successfully", user }, 201);
      } catch (err) {
        if (isUnique(err, "email")) return fail(409, "Email already exists");
        if (isUnique(err, "username")) return fail(409, "Username already exists");
        throw err;
      }
    },

    async login({ email, password } = {}) {
      if (!email || !password) return fail(400, "Email and password are required");
      const row = await repo.findUserWithPassword(db, text(email));
      if (!row || !(await comparePassword(String(password), row.password))) {
        return fail(401, "Invalid email or password");
      }
      const user = await repo.findUserById(db, row.id);
      return ok({ message: "Login successful", ...session(user) });
    },

    async getProfile(userId) {
      const user = await repo.findUserById(db, userId);
      return user ? ok(user) : fail(404, "User not found");
    },

    async editProfile(userId, { email, username, fullname, avatar } = {}) {
      const data = { email: text(email).toLowerCase(), username: text(username), fullname: text(fullname) };
      if (!data.email || !data.username || !data.fullname) return fail(400, "All fields are required");
      if (!EMAIL_RE.test(data.email)) return fail(400, "Please enter a valid email address");
      if (avatar !== undefined && (typeof avatar !== "string" || avatar.length > AVATAR_MAX)) {
        return fail(400, "Profile photo is too large");
      }
      try {
        const user = await repo.updateProfile(db, userId, { ...data, avatar });
        return user ? ok({ message: "Profile updated successfully", ...session(user) }) : fail(404, "User not found");
      } catch (err) {
        if (isUnique(err, "email")) return fail(409, "Email already exists");
        if (isUnique(err, "username")) return fail(409, "Username already exists");
        throw err;
      }
    },

    async changePassword(userId, { oldPassword, newPassword } = {}) {
      if (!oldPassword || !newPassword) return fail(400, "Old password and new password are required");
      if (String(newPassword).length < 6) return fail(400, "New password must be at least 6 characters");
      const row = await repo.findUserWithPasswordById(db, userId);
      if (!row) return fail(404, "User not found");
      // 400 (not 401): a wrong old password must not look like an expired session.
      if (!(await comparePassword(String(oldPassword), row.password))) return fail(400, "Old password is incorrect");
      await repo.updatePassword(db, userId, await hashPassword(String(newPassword)));
      return ok({ message: "Password updated successfully" });
    },

    // ----- library --------------------------------------------------------
    async getLibrary(userId) {
      return ok(await repo.getLibrary(db, userId));
    },

    async importLibrary(userId, { watchlist = [], ratings = {} } = {}) {
      const items = (Array.isArray(watchlist) ? watchlist : []).map(parseWatchlistItem).filter(Boolean).slice(0, 500);
      const rated = Object.entries(ratings && typeof ratings === "object" ? ratings : {})
        .map(([key, value]) => {
          const [type, id] = String(key).split("-");
          const title = parseTitle(type, id);
          const stars = Number(value);
          return title && Number.isInteger(stars) && stars >= 1 && stars <= 5
            ? { media_type: title.mediaType, id: title.tmdbId, value: stars }
            : null;
        })
        .filter(Boolean)
        .slice(0, 1000);
      await repo.importLibrary(db, userId, { watchlist: items, ratings: rated });
      return ok({ message: "Library imported" });
    },

    async addWatchlist(userId, mediaType, id, body) {
      const item = parseWatchlistItem({ ...body, media_type: mediaType, id });
      if (!item) return fail(400, "Invalid title");
      await repo.addWatchlistItem(db, userId, item);
      return ok({ message: "Added to watchlist" }, 201);
    },

    async removeWatchlist(userId, mediaType, id) {
      const title = parseTitle(mediaType, id);
      if (!title) return fail(400, "Invalid title");
      await repo.removeWatchlistItem(db, userId, title.mediaType, title.tmdbId);
      return ok({ message: "Removed from watchlist" });
    },

    async clearWatchlist(userId) {
      const removed = await repo.clearWatchlist(db, userId);
      return ok({ message: "Watchlist cleared", removed });
    },

    async setRating(userId, mediaType, id, { value } = {}) {
      const title = parseTitle(mediaType, id);
      const stars = Number(value);
      if (!title || !Number.isInteger(stars) || stars < 1 || stars > 5) return fail(400, "Rating must be 1 to 5");
      await repo.setRating(db, userId, title.mediaType, title.tmdbId, stars);
      return ok({ message: "Rating saved", value: stars });
    },

    async removeRating(userId, mediaType, id) {
      const title = parseTitle(mediaType, id);
      if (!title) return fail(400, "Invalid title");
      await repo.removeRating(db, userId, title.mediaType, title.tmdbId);
      return ok({ message: "Rating removed" });
    },

    // ----- reviews --------------------------------------------------------
    async listReviews(mediaType, id) {
      const title = parseTitle(mediaType, id);
      if (!title) return fail(400, "Invalid title");
      return ok({ reviews: await repo.listReviews(db, title.mediaType, title.tmdbId) });
    },

    async addReview(userId, mediaType, id, { rating, text: body } = {}) {
      const title = parseTitle(mediaType, id);
      const stars = Number(rating);
      const content = text(body);
      if (!title) return fail(400, "Invalid title");
      if (!Number.isInteger(stars) || stars < 1 || stars > 5) return fail(400, "Rating must be 1 to 5");
      if (!content) return fail(400, "Review text is required");
      if (content.length > REVIEW_MAX) return fail(400, `Review must be ${REVIEW_MAX} characters or fewer`);
      const created = await repo.addReview(db, userId, title.mediaType, title.tmdbId, { rating: stars, text: content });
      return ok({ review: created }, 201);
    },

    async deleteReview(userId, reviewId) {
      const id = Number(reviewId);
      if (!Number.isSafeInteger(id) || id <= 0) return fail(400, "Invalid review");
      return (await repo.deleteReview(db, userId, id)) ? ok({ message: "Review deleted" }) : fail(404, "Review not found");
    },
  };
}

module.exports = { createService, parseTitle, parseWatchlistItem };
