import { Pool } from "pg";
import { readFileSync } from "node:fs";

const ssl =
  process.env.DB_SSL === "true"
    ? {
        ca: readFileSync(
          process.env.DB_SSL_CA_PATH || "/app/certs/global-bundle.pem",
          "utf8"
        ),
        rejectUnauthorized: true,
      }
    : undefined;

export const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || "jobclose",
  user: process.env.DB_USER || "jobclose",
  password: process.env.DB_PASSWORD,
  ssl,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL connection error:", error);
});