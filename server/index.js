require("dotenv").config();

const { createPool } = require("./db");
const repo = require("./repo");
const auth = require("./auth");
const { createService } = require("./service");
const { createApp } = require("./app");

const db = createPool();
const service = createService({
  repo,
  db,
  hashPassword: auth.hashPassword,
  comparePassword: auth.comparePassword,
  signToken: auth.signToken,
});

const app = createApp({ service, auth });

if (require.main === module) {
  const PORT = Number(process.env.API_PORT || process.env.PORT) || 3001;
  const server = app.listen(PORT, () => {
    console.log(`Moviews API running on http://localhost:${PORT}`);
  });

  // Fail fast (and visibly) when the Neon connection string is wrong.
  db.query("SELECT 1").then(
    () => console.log("Connected to Neon PostgreSQL"),
    (err) => console.error("Could not connect to the database:", err.message)
  );

  const shutdown = () => server.close(() => db.end().then(() => process.exit(0)));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = app;
