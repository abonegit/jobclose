import { Pool } from "pg";
import { readFileSync } from "node:fs";

const requiredEnv = [
  "DB_HOST",
  "DB_NAME",
  "ADMIN_DB_USER",
  "ADMIN_DB_PASSWORD",
  "APP_DB_USER",
  "APP_DB_PASSWORD",
];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const dbHost = process.env.DB_HOST!;
const dbPort = Number(process.env.DB_PORT || 5432);
const dbName = process.env.DB_NAME!;
const adminUser = process.env.ADMIN_DB_USER!;
const adminPassword = process.env.ADMIN_DB_PASSWORD!;
const appUser = process.env.APP_DB_USER!;
const appPassword = process.env.APP_DB_PASSWORD!;

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

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: adminUser,
  password: adminPassword,
  ssl,
  connectionTimeoutMillis: 10000,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log("Connecting to PostgreSQL...");
    await client.query("SELECT 1");
    console.log("Database connection successful.");

    await client.query("BEGIN");

    // Create or update the restricted application database user.
    const existingRole = await client.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [appUser]
    );

    const roleSql = existingRole.rowCount
      ? "ALTER ROLE %I LOGIN PASSWORD %L"
      : "CREATE ROLE %I LOGIN PASSWORD %L";

    const roleCommand = await client.query(
  "SELECT format($1::text, $2::text, $3::text) AS command",
  [roleSql, appUser, appPassword]
);
    await client.query(roleCommand.rows[0].command);
    console.log("Application database user is ready.");

    // Create the customers table.
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(254),
        phone VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    console.log("Customers table is ready.");

    // Create the jobs table.
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        customer_id BIGINT NOT NULL
          REFERENCES customers(id) ON DELETE RESTRICT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        scheduled_date DATE,
        status VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
        estimated_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT jobs_estimated_cost_check
          CHECK (estimated_cost >= 0),
        CONSTRAINT jobs_status_check
          CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled'))
      )
    `);

    console.log("Jobs table is ready.");

    // Give the application account only the permissions it needs.
    const grantCommand = await client.query(
      `SELECT format(
        'GRANT CONNECT ON DATABASE %I TO %I;
        GRANT USAGE ON SCHEMA public TO %I;
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I;
        GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO %I',
        $1::text, $2::text, $2::text, $2::text, $2::text
      ) AS command`,
      [dbName, appUser]
    );

    await client.query(grantCommand.rows[0].command);

    // Apply the same permissions to future tables and sequences
    // created by the migration account.
    const defaultPrivileges = await client.query(
      `SELECT format(
        'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I;
        ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public
          GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO %I',
        $1::text, $2::text, $1::text, $2::text
      ) AS command`,
      [adminUser, appUser]
    );

    await client.query(defaultPrivileges.rows[0].command);

    await client.query("COMMIT");

    console.log("Database migration completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
