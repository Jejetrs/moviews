// Applies database/schema.sql to the database in DATABASE_URL (e.g. your Neon project).
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { createPool } = require("../server/db");

(async () => {
  const pool = createPool();
  try {
    await pool.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
    const { rows } = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1"
    );
    console.log("Schema applied. Tables:", rows.map((r) => r.table_name).join(", "));
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
