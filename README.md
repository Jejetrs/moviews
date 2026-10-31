# Moviews

Movie & TV review app: React (create-react-app) + Express API + **Neon PostgreSQL**.
Titles, posters and trailers come from TMDB; accounts, watchlists, ratings and reviews live in Neon.

## Architecture

```
React app (src/)  ──REACT_APP_API_URL──▶  Express API (server/)  ──DATABASE_URL──▶  Neon PostgreSQL
        │                                                                              (database/schema.sql)
        └── TMDB API (REACT_APP_ACCESS_TOKEN)
```

## 1. Create the database on Neon

1. Create a project at <https://console.neon.tech> and copy the connection string (**Connect** → pooled).
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `JWT_SECRET`, `REACT_APP_ACCESS_TOKEN`.
3. Apply the schema (safe to re-run):

```bash
npm install
npm run db:migrate          # or: psql "$DATABASE_URL" -f database/schema.sql
```

### Schema (`database/schema.sql`)

| Table | Purpose | Key |
| --- | --- | --- |
| `users` | accounts (bcrypt hash, optional avatar); email/username unique, case-insensitive | `id` |
| `watchlist_items` | saved titles with a snapshot of what the cards show | `(user_id, media_type, tmdb_id)` |
| `ratings` | one 1–5 star rating per user and title | `(user_id, media_type, tmdb_id)` |
| `reviews` | community reviews (≤ 600 chars) with a 1–5 rating | `id`, indexed by title |

Titles are referenced by `(media_type, tmdb_id)` — the app's `movie-603` / `tv-1399` keys — so there is no
local movie table to keep in sync with TMDB. Deleting a user cascades to all of their data.

## 2. Run

```bash
npm run server      # API on http://localhost:3001  (npm run server:dev to auto-restart)
npm start           # React app on http://localhost:3000
```

`PORT` is reserved for the React development server and `API_PORT` is used by Express, so both can run at the same time.

## Deploying to Vercel

This project deploys the React build and Express API together. The API is exposed as a Vercel Function under `/api`.

1. Import the repository into Vercel.
2. Add these Environment Variables for Production (use the real values, never commit them):
   - `DATABASE_URL` — Neon pooled connection string
   - `JWT_SECRET` — a long random secret
   - `JWT_EXPIRES_IN` — for example `7d`
   - `CORS_ORIGIN` — the deployed Vercel URL, for example `https://moviews.vercel.app`
   - `REACT_APP_API_URL` — `/api`
   - `REACT_APP_ACCESS_TOKEN` — TMDB read access token
3. Deploy. The frontend is served at the Vercel URL and the API health check is at `/api/health`.
4. Apply the schema once against Neon before registering users:

```bash
npm run db:migrate
```

`PORT` and `API_PORT` are only for local development; Vercel supplies the function runtime.

## API

Sessions use a JWT (`Authorization: Bearer …`) returned by `/login`; the user id always comes from the token.

| Method & path | Auth | |
| --- | --- | --- |
| `POST /register`, `POST /login` | – | create account / sign in (returns `token`) |
| `GET /get-profile`, `POST /edit-profile`, `POST /change-password` | ✔ | profile & password |
| `GET /library` | ✔ | watchlist, ratings and own reviews |
| `POST /library/import` | ✔ | merge a guest's local watchlist/ratings after login |
| `PUT/DELETE /watchlist/:type/:id`, `DELETE /watchlist` | ✔ | add / remove / clear |
| `PUT/DELETE /ratings/:type/:id` | ✔ | set / remove a star rating |
| `GET /titles/:type/:id/reviews` | – | community reviews |
| `POST /titles/:type/:id/reviews`, `DELETE /reviews/:id` | ✔ | write / delete own review |
| `GET /health` | – | checks the database connection |

`:type` is `movie` or `tv`.

## How the app uses the database

* Signed in: watchlist, ratings and reviews are read from and written to Neon (`src/storejs/library.js`);
  the UI updates immediately and rolls back if a request fails.
* Signed out: watchlist and ratings stay in the browser (as before) and are merged into the account at login.
  Posting a review requires an account.
* Logging out clears the library from the browser.

## Tests

```bash
TEST_DATABASE_URL=postgresql://… npm run test:server
```

Runs the API rules against a real database (use a scratch database or a Neon branch).

## Deploying

* Run the API anywhere Node runs (Render, Railway, Fly…) with the variables from `.env.example`; set
  `CORS_ORIGIN` to the site URL.
* Build the React app with `REACT_APP_API_URL` pointing at the deployed API.
