/**
 * Data access layer. Every function takes a `db` with `query(text, params)`
 * (a pg Pool in production) and returns plain objects shaped for the React app.
 */
const itemKey = (row) => `${row.media_type}-${row.tmdb_id}`;

const publicUser = (row) =>
  row && {
    id: Number(row.id),
    email: row.email,
    username: row.username,
    fullname: row.fullname,
    avatar: row.avatar || "",
  };

const watchlistItem = (row) => ({
  key: itemKey(row),
  id: Number(row.tmdb_id),
  media_type: row.media_type,
  title: row.title,
  poster_path: row.poster_path,
  vote_average: Number(row.vote_average),
  release_date: row.release_date || "",
  overview: row.overview,
  addedAt: Number(row.added_ms),
});

const review = (row) => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  user: row.username,
  rating: Number(row.rating),
  text: row.body,
  createdAt: Number(row.created_ms),
});

const WATCHLIST_COLUMNS = `media_type, tmdb_id, title, poster_path, vote_average,
  release_date::text AS release_date, overview,
  (extract(epoch FROM added_at) * 1000)::double precision AS added_ms`;

const REVIEW_SELECT = `SELECT r.id, r.user_id, u.username, r.rating, r.body,
  (extract(epoch FROM r.created_at) * 1000)::double precision AS created_ms`;

// ----- users --------------------------------------------------------------

async function createUser(db, { email, password, username, fullname }) {
  const { rows } = await db.query(
    `INSERT INTO users (email, password, username, fullname)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, username, fullname, avatar`,
    [email, password, username, fullname]
  );
  return publicUser(rows[0]);
}

/** Returns the raw row (including the password hash) — only for login / password change. */
async function findUserWithPassword(db, email) {
  const { rows } = await db.query("SELECT * FROM users WHERE lower(email) = lower($1)", [email]);
  return rows[0] || null;
}

async function findUserWithPasswordById(db, id) {
  const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] || null;
}

async function findUserById(db, id) {
  const { rows } = await db.query(
    "SELECT id, email, username, fullname, avatar FROM users WHERE id = $1",
    [id]
  );
  return publicUser(rows[0]) || null;
}

/** `avatar` is only touched when it is not undefined, so profile edits never wipe the photo. */
async function updateProfile(db, id, { email, username, fullname, avatar }) {
  const { rows } = await db.query(
    `UPDATE users
        SET email = $2, username = $3, fullname = $4,
            avatar = CASE WHEN $5::boolean THEN $6 ELSE avatar END
      WHERE id = $1
      RETURNING id, email, username, fullname, avatar`,
    [id, email, username, fullname, avatar !== undefined, avatar ?? null]
  );
  return publicUser(rows[0]) || null;
}

async function updatePassword(db, id, passwordHash) {
  const { rows } = await db.query("UPDATE users SET password = $2 WHERE id = $1 RETURNING id", [id, passwordHash]);
  return rows.length > 0;
}

// ----- library ------------------------------------------------------------

async function getLibrary(db, userId) {
  const [watch, rate, mine] = await Promise.all([
    db.query(
      `SELECT ${WATCHLIST_COLUMNS} FROM watchlist_items WHERE user_id = $1 ORDER BY added_at DESC`,
      [userId]
    ),
    db.query("SELECT media_type, tmdb_id, value FROM ratings WHERE user_id = $1", [userId]),
    db.query(
      `${REVIEW_SELECT}, r.media_type, r.tmdb_id
         FROM reviews r JOIN users u ON u.id = r.user_id
        WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [userId]
    ),
  ]);

  const ratings = {};
  rate.rows.forEach((row) => {
    ratings[itemKey(row)] = Number(row.value);
  });
  const reviews = {};
  mine.rows.forEach((row) => {
    (reviews[itemKey(row)] ||= []).push(review(row));
  });

  return { watchlist: watch.rows.map(watchlistItem), ratings, reviews };
}

async function addWatchlistItem(db, userId, item) {
  await db.query(
    `INSERT INTO watchlist_items (user_id, media_type, tmdb_id, title, poster_path, vote_average, release_date, overview)
     VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, '')::date, $8)
     ON CONFLICT (user_id, media_type, tmdb_id) DO NOTHING`,
    [userId, item.media_type, item.id, item.title, item.poster_path, item.vote_average, item.release_date, item.overview]
  );
}

async function removeWatchlistItem(db, userId, mediaType, tmdbId) {
  const { rowCount } = await db.query(
    "DELETE FROM watchlist_items WHERE user_id = $1 AND media_type = $2 AND tmdb_id = $3",
    [userId, mediaType, tmdbId]
  );
  return rowCount > 0;
}

async function clearWatchlist(db, userId) {
  const { rowCount } = await db.query("DELETE FROM watchlist_items WHERE user_id = $1", [userId]);
  return rowCount;
}

async function setRating(db, userId, mediaType, tmdbId, value) {
  await db.query(
    `INSERT INTO ratings (user_id, media_type, tmdb_id, value) VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, media_type, tmdb_id) DO UPDATE SET value = EXCLUDED.value`,
    [userId, mediaType, tmdbId, value]
  );
}

async function removeRating(db, userId, mediaType, tmdbId) {
  await db.query("DELETE FROM ratings WHERE user_id = $1 AND media_type = $2 AND tmdb_id = $3", [
    userId,
    mediaType,
    tmdbId,
  ]);
}

/**
 * Merges a guest's local watchlist/ratings into the account in one statement.
 * Existing server data always wins.
 */
async function importLibrary(db, userId, { watchlist, ratings }) {
  await db.query(
    `INSERT INTO watchlist_items (user_id, media_type, tmdb_id, title, poster_path, vote_average, release_date, overview)
     SELECT $1, i.media_type, i.id, i.title, i.poster_path, COALESCE(i.vote_average, 0), NULLIF(i.release_date, '')::date, COALESCE(i.overview, '')
       FROM jsonb_to_recordset($2::jsonb) AS i(media_type text, id bigint, title text, poster_path text,
                                                vote_average numeric, release_date text, overview text)
     ON CONFLICT (user_id, media_type, tmdb_id) DO NOTHING`,
    [userId, JSON.stringify(watchlist)]
  );
  await db.query(
    `INSERT INTO ratings (user_id, media_type, tmdb_id, value)
     SELECT $1, i.media_type, i.id, i.value
       FROM jsonb_to_recordset($2::jsonb) AS i(media_type text, id bigint, value smallint)
     ON CONFLICT (user_id, media_type, tmdb_id) DO NOTHING`,
    [userId, JSON.stringify(ratings)]
  );
}

// ----- reviews ------------------------------------------------------------

async function listReviews(db, mediaType, tmdbId, limit = 100) {
  const { rows } = await db.query(
    `${REVIEW_SELECT}
       FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.media_type = $1 AND r.tmdb_id = $2
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $3`,
    [mediaType, tmdbId, limit]
  );
  return rows.map(review);
}

/** Inserts the review and the matching star rating together, then returns the review. */
async function addReview(db, userId, mediaType, tmdbId, { rating, text }) {
  const { rows } = await db.query(
    `WITH new_review AS (
       INSERT INTO reviews (user_id, media_type, tmdb_id, rating, body)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, rating, body, created_at
     ), new_rating AS (
       INSERT INTO ratings (user_id, media_type, tmdb_id, value) VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, media_type, tmdb_id) DO UPDATE SET value = EXCLUDED.value
     )
     SELECT r.id, r.user_id, u.username, r.rating, r.body,
            (extract(epoch FROM r.created_at) * 1000)::double precision AS created_ms
       FROM new_review r JOIN users u ON u.id = r.user_id`,
    [userId, mediaType, tmdbId, rating, text]
  );
  return review(rows[0]);
}

/** Only the author can delete a review. */
async function deleteReview(db, userId, reviewId) {
  const { rowCount } = await db.query("DELETE FROM reviews WHERE id = $1 AND user_id = $2", [reviewId, userId]);
  return rowCount > 0;
}

module.exports = {
  createUser,
  findUserWithPassword,
  findUserWithPasswordById,
  findUserById,
  updateProfile,
  updatePassword,
  getLibrary,
  addWatchlistItem,
  removeWatchlistItem,
  clearWatchlist,
  setRating,
  removeRating,
  importLibrary,
  listReviews,
  addReview,
  deleteReview,
};
