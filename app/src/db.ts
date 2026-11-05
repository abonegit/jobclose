import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || "jobclose",
  user: process.env.DB_USER || "jobclose",
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL connection error:", error);
});