const express = require("express");
const cors = require("cors");

/** Builds the Express app. `auth` provides requireAuth; `service` holds the business rules. */
function createApp({ service, auth }) {
  const app = express();
  const origins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((o) => o.trim());
  app.use(cors({ origin: origins.includes("*") ? true : origins }));
  app.use(express.json({ limit: "512kb" }));

  // Wraps a service call: sends its { status, body }, forwards unexpected errors to the handler below.
  const handle = (fn) => async (req, res, next) => {
    try {
      const { status, body } = await fn(req);
      res.status(status).json(body);
    } catch (err) {
      next(err);
    }
  };
  const { requireAuth } = auth;

  app.get("/", (req, res) => res.send("Moviews API is running!"));
  app.get("/health", handle(() => service.health()));

  // accounts
  app.post("/register", handle((req) => service.register(req.body)));
  app.post("/login", handle((req) => service.login(req.body)));
  app.get("/get-profile", requireAuth, handle((req) => service.getProfile(req.userId)));
  app.post("/edit-profile", requireAuth, handle((req) => service.editProfile(req.userId, req.body)));
  app.post("/change-password", requireAuth, handle((req) => service.changePassword(req.userId, req.body)));

  // watchlist, ratings
  app.get("/library", requireAuth, handle((req) => service.getLibrary(req.userId)));
  app.post("/library/import", requireAuth, handle((req) => service.importLibrary(req.userId, req.body)));
  app.delete("/watchlist", requireAuth, handle((req) => service.clearWatchlist(req.userId)));
  app.put("/watchlist/:type/:id", requireAuth, handle((req) => service.addWatchlist(req.userId, req.params.type, req.params.id, req.body)));
  app.delete("/watchlist/:type/:id", requireAuth, handle((req) => service.removeWatchlist(req.userId, req.params.type, req.params.id)));
  app.put("/ratings/:type/:id", requireAuth, handle((req) => service.setRating(req.userId, req.params.type, req.params.id, req.body)));
  app.delete("/ratings/:type/:id", requireAuth, handle((req) => service.removeRating(req.userId, req.params.type, req.params.id)));

  // reviews (reading is public, writing needs a session)
  app.get("/titles/:type/:id/reviews", handle((req) => service.listReviews(req.params.type, req.params.id)));
  app.post("/titles/:type/:id/reviews", requireAuth, handle((req) => service.addReview(req.userId, req.params.type, req.params.id, req.body)));
  app.delete("/reviews/:id", requireAuth, handle((req) => service.deleteReview(req.userId, req.params.id)));

  app.use((req, res) => res.status(404).json({ message: "Not found" }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}

module.exports = { createApp };
