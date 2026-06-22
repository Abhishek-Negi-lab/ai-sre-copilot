const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "ai_sre_copilot",
  user: process.env.DB_USER || "ai_sre_user",
  password: process.env.DB_PASSWORD || "ai_sre_password",
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 2000),
});

async function query(text, params) {
  return pool.query(text, params);
}

async function checkDatabase() {
  const startTime = Date.now();
  const result = await pool.query("SELECT NOW() AS current_time");
  const responseTimeMs = Date.now() - startTime;

  return {
    status: "connected",
    responseTimeMs,
    currentTime: result.rows[0].current_time,
  };
}

async function closeDatabase() {
  await pool.end();
}

module.exports = {
  query,
  checkDatabase,
  closeDatabase,
};
