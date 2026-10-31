const { Pool } = require("pg");

/**
 * Neon connection pool. DATABASE_URL is the Neon connection string
 * (postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require).
 * Use the pooled host (…-pooler…) when deploying to serverless platforms.
 */
function createPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.");
  }
  if (!/^(postgres|postgresql):\/\//.test(connectionString)) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string beginning with postgres:// or postgresql://.");
  }
  return new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX) || 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
}

module.exports = { createPool };
