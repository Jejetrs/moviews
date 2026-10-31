// Integration test for the service + repository layers against a real PostgreSQL database.
//   TEST_DATABASE_URL=postgresql://... npm run test:server
// Use a throwaway database or Neon branch: the test creates users and deletes them afterwards.
const test = require("node:test");
const assert = require("node:assert/strict");
const { createPool } = require("../db");
const repo = require("../repo");
const { createService } = require("../service");

const url = process.env.TEST_DATABASE_URL;
if (!url) {
  console.log("TEST_DATABASE_URL is not set — skipping database tests.");
  process.exit(0);
}

const db = createPool(url);
// bcrypt is not needed to exercise the data rules; a reversible stand-in keeps the test fast.
const service = createService({
  repo,
  db,
  hashPassword: async (p) => `hash:${p}`,
  comparePassword: async (p, h) => h === `hash:${p}`,
  signToken: (u) => `token-${u.id}`,
});

const run = Date.now();
const alice = { email: `Alice${run}@Example.com`, password: "secret1", username: `alice${run}`, fullname: "Alice A" };
const bob = { email: `bob${run}@example.com`, password: "secret2", username: `bob${run}`, fullname: "Bob B" };
let aliceId, bobId;

test.after(async () => {
  await db.query("DELETE FROM users WHERE username = ANY($1)", [[alice.username, bob.username]]);
  await db.end();
});

test("schema is applied", async () => {
  const { rows } = await db.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  const names = rows.map((r) => r.table_name);
  for (const t of ["users", "watchlist_items", "ratings", "reviews"]) assert.ok(names.includes(t), `${t} missing`);
});

test("register validates and rejects duplicates case-insensitively", async () => {
  assert.equal((await service.register({ email: "x" })).status, 400);
  assert.equal((await service.register({ ...alice, email: "not-an-email" })).status, 400);
  assert.equal((await service.register({ ...alice, password: "123" })).status, 400);
  const created = await service.register(alice);
  assert.equal(created.status, 201);
  aliceId = created.body.user.id;
  assert.equal(created.body.user.email, alice.email.toLowerCase());
  assert.equal((await service.register({ ...alice, email: alice.email.toUpperCase(), username: "other" + run })).status, 409);
  assert.equal((await service.register({ ...alice, email: `x${run}@example.com`, username: alice.username.toUpperCase() })).status, 409);
  bobId = (await service.register(bob)).body.user.id;
});

test("login returns a token and never the password", async () => {
  const bad = await service.login({ email: alice.email, password: "wrong" });
  assert.equal(bad.status, 401);
  const good = await service.login({ email: alice.email.toUpperCase(), password: alice.password });
  assert.equal(good.status, 200);
  assert.equal(good.body.token, `token-${aliceId}`);
  assert.equal(good.body.user.password, undefined);
});

test("profile edit keeps the avatar unless one is sent; duplicates are rejected", async () => {
  const withAvatar = await service.editProfile(aliceId, { ...alice, avatar: "data:image/jpeg;base64,AAAA" });
  assert.equal(withAvatar.status, 200);
  const renamed = await service.editProfile(aliceId, { email: alice.email, username: alice.username, fullname: "Alice Z" });
  assert.equal(renamed.body.user.fullname, "Alice Z");
  assert.equal(renamed.body.user.avatar, "data:image/jpeg;base64,AAAA");
  assert.equal((await service.editProfile(aliceId, { email: bob.email, username: alice.username, fullname: "x" })).status, 409);
});

test("change password checks the old one", async () => {
  assert.equal((await service.changePassword(aliceId, { oldPassword: "nope", newPassword: "abcdef" })).status, 400);
  assert.equal((await service.changePassword(aliceId, { oldPassword: alice.password, newPassword: "abcdef" })).status, 200);
  assert.equal((await service.login({ email: alice.email, password: "abcdef" })).status, 200);
});

test("watchlist add is idempotent, removal and clear work, data is per user", async () => {
  const body = { title: "The Matrix", poster_path: "/p.jpg", vote_average: 8.2, release_date: "1999-03-31", overview: "Neo." };
  assert.equal((await service.addWatchlist(aliceId, "movie", 603, body)).status, 201);
  await service.addWatchlist(aliceId, "movie", 603, body);
  await service.addWatchlist(aliceId, "tv", 1399, { title: "GoT", release_date: "" });
  assert.equal((await service.addWatchlist(aliceId, "book", 1, body)).status, 400);
  assert.equal((await service.addWatchlist(aliceId, "movie", 5, {})).status, 400);

  const lib = (await service.getLibrary(aliceId)).body;
  assert.equal(lib.watchlist.length, 2);
  const matrix = lib.watchlist.find((i) => i.key === "movie-603");
  assert.deepEqual(
    { id: matrix.id, media_type: matrix.media_type, title: matrix.title, vote_average: matrix.vote_average, release_date: matrix.release_date },
    { id: 603, media_type: "movie", title: "The Matrix", vote_average: 8.2, release_date: "1999-03-31" }
  );
  assert.ok(matrix.addedAt > 1.6e12);
  assert.equal((await service.getLibrary(bobId)).body.watchlist.length, 0);

  await service.removeWatchlist(aliceId, "movie", 603);
  assert.equal((await service.getLibrary(aliceId)).body.watchlist.length, 1);
  assert.equal((await service.clearWatchlist(aliceId)).body.removed, 1);
});

test("ratings upsert, validate and delete", async () => {
  assert.equal((await service.setRating(aliceId, "movie", 603, { value: 6 })).status, 400);
  await service.setRating(aliceId, "movie", 603, { value: 3 });
  await service.setRating(aliceId, "movie", 603, { value: 5 });
  assert.deepEqual((await service.getLibrary(aliceId)).body.ratings, { "movie-603": 5 });
  await service.removeRating(aliceId, "movie", 603);
  assert.deepEqual((await service.getLibrary(aliceId)).body.ratings, {});
});

test("reviews are public, validated, set the rating and only the author can delete", async () => {
  assert.equal((await service.addReview(aliceId, "movie", 27205, { rating: 5, text: "   " })).status, 400);
  assert.equal((await service.addReview(aliceId, "movie", 27205, { rating: 0, text: "hi" })).status, 400);
  assert.equal((await service.addReview(aliceId, "movie", 27205, { rating: 5, text: "x".repeat(601) })).status, 400);

  const first = await service.addReview(aliceId, "movie", 27205, { rating: 5, text: "  Mind-bending.  " });
  assert.equal(first.status, 201);
  assert.equal(first.body.review.text, "Mind-bending.");
  assert.equal(first.body.review.user, alice.username);
  const second = await service.addReview(bobId, "movie", 27205, { rating: 3, text: "Okay." });

  const list = (await service.listReviews("movie", 27205)).body.reviews;
  assert.deepEqual(list.map((r) => r.user), [bob.username, alice.username]); // newest first
  assert.deepEqual((await service.getLibrary(aliceId)).body.ratings, { "movie-27205": 5 });
  assert.equal((await service.getLibrary(aliceId)).body.reviews["movie-27205"].length, 1);

  assert.equal((await service.deleteReview(aliceId, second.body.review.id)).status, 404); // not hers
  assert.equal((await service.deleteReview(aliceId, first.body.review.id)).status, 200);
  assert.equal((await service.listReviews("movie", 27205)).body.reviews.length, 1);
});

test("guest library import merges without overwriting and skips bad rows", async () => {
  await service.setRating(bobId, "movie", 10, { value: 2 });
  await service.importLibrary(bobId, {
    watchlist: [{ media_type: "movie", id: 10, title: "Ten", vote_average: 7, release_date: "2001-01-01", overview: "" }, { id: "x" }],
    ratings: { "movie-10": 5, "tv-20": 4, "bad-1": 3, "movie-30": 9 },
  });
  const lib = (await service.getLibrary(bobId)).body;
  assert.equal(lib.watchlist.length, 1);
  assert.deepEqual(lib.ratings, { "movie-27205": 3, "movie-10": 2, "tv-20": 4 }); // 27205 came from his review
});

test("deleting a user cascades to their data", async () => {
  await db.query("DELETE FROM users WHERE id = $1", [bobId]);
  const { rows } = await db.query("SELECT (SELECT count(*) FROM ratings WHERE user_id=$1) + (SELECT count(*) FROM reviews WHERE user_id=$1) + (SELECT count(*) FROM watchlist_items WHERE user_id=$1) AS n", [bobId]);
  assert.equal(Number(rows[0].n), 0);
});
