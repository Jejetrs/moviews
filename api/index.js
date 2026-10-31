let app;

try {
  app = require("../server");
} catch (error) {
  console.error("API startup failed:", error.message);
  module.exports = (req, res) => {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "API configuration error. Check Vercel function logs." }));
  };
}

// Vercel mounts this function below /api. Remove that prefix so the existing
// Express routes (/login, /library, etc.) work unchanged.
if (app) {
  module.exports = (req, res) => {
    if (req.url === "/api" || req.url.startsWith("/api/")) {
      req.url = req.url.slice(4) || "/";
    }
    return app(req, res);
  };
}
