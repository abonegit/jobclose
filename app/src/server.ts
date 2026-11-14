import express from "express";
import path from "node:path";
import { pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

const frontendDirectory = path.resolve(
  process.cwd(),
  "frontend/dist"
);
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/customers", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, created_at
       FROM customers
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to list customers:", error);
    res.status(500).json({ error: "Unable to retrieve customers" });
  }
});

app.post("/api/customers", async (req, res) => {
  const { name, email, phone } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Customer name is required" });
    return;
  }

  if (
    email !== undefined &&
    email !== null &&
    typeof email !== "string"
  ) {
    res.status(400).json({ error: "Email must be a string" });
    return;
  }

  if (
    phone !== undefined &&
    phone !== null &&
    typeof phone !== "string"
  ) {
    res.status(400).json({ error: "Phone must be a string" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers (name, email, phone)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, phone, created_at`,
      [
        name.trim(),
        typeof email === "string" && email.trim()
          ? email.trim()
          : null,
        typeof phone === "string" && phone.trim()
          ? phone.trim()
          : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to create customer:", error);
    res.status(500).json({ error: "Unable to create customer" });
  }
});
const validJobStatuses = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
];

// List all jobs, including their customer details.
app.get("/api/jobs", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        j.id,
        'JC-' || LPAD(j.id::text, 3, '0') AS job_reference,
        j.customer_id,
        c.name AS customer_name,
        j.title,
        j.description,
        j.scheduled_date,
        j.status,
        j.estimated_cost,
        j.created_at
      FROM jobs j
      JOIN customers c ON c.id = j.customer_id
      ORDER BY j.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to retrieve jobs:", error);
    res.status(500).json({ error: "Unable to retrieve jobs" });
  }
});

// Create a job.
app.post("/api/jobs", async (req, res) => {
  const {
    customer_id,
    title,
    description,
    scheduled_date,
    estimated_cost,
  } = req.body ?? {};

  const customerId = Number(customer_id);
  const cost = Number(estimated_cost ?? 0);

  if (!Number.isSafeInteger(customerId) || customerId <= 0) {
    res.status(400).json({ error: "A valid customer_id is required" });
    return;
  }

  if (typeof title !== "string" || !title.trim()) {
    res.status(400).json({ error: "Job title is required" });
    return;
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    res.status(400).json({ error: "Description must be a string" });
    return;
  }

  if (
    scheduled_date !== undefined &&
    scheduled_date !== null &&
    (typeof scheduled_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(scheduled_date) ||
      !isValidDate(scheduled_date))
  ) {
    res.status(400).json({ error: "Scheduled date must be a valid YYYY-MM-DD date" });
    return;
  }

  if (
    !Number.isFinite(cost) ||
    cost < 0 ||
    !/^\d+(\.\d{1,2})?$/.test(String(estimated_cost ?? 0))
  ) {
    res.status(400).json({ error: "Estimated cost must be a non-negative amount with up to two decimal places" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO jobs
        (customer_id, title, description, scheduled_date, estimated_cost)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         'JC-' || LPAD(id::text, 3, '0') AS job_reference,
         customer_id,
         title,
         description,
         scheduled_date,
         status,
         estimated_cost,
         created_at`,
      [
        customerId,
        title.trim(),
        description?.trim() || null,
        scheduled_date || null,
        cost,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    const dbError = error as { code?: string };

    if (dbError.code === "23503") {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    console.error("Failed to create job:", error);
    res.status(500).json({ error: "Unable to create job" });
  }
});

// Check whether a calendar date is real.
function isValidDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}

// Retrieve one job.
app.get("/api/jobs/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid job ID" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT
         j.id,
         'JC-' || LPAD(j.id::text, 3, '0') AS job_reference,
         j.customer_id,
         c.name AS customer_name,
         j.title,
         j.description,
         j.scheduled_date,
         j.status,
         j.estimated_cost,
         j.created_at
       FROM jobs j
       JOIN customers c ON c.id = j.customer_id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to retrieve job:", error);
    res.status(500).json({ error: "Unable to retrieve job" });
  }
});

// Update a job's status.
app.patch("/api/jobs/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid job ID" });
    return;
  }

  if (
    typeof status !== "string" ||
    !validJobStatuses.includes(status)
  ) {
    res.status(400).json({
      error: "Invalid status",
      validStatuses: validJobStatuses,
    });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE jobs
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update job:", error);
    res.status(500).json({ error: "Unable to update job" });
  }
});
async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to PostgreSQL");

    app.use(express.static(frontendDirectory));

    app.use((req, res, next) => {
      if (
        req.method !== "GET" ||
        req.path.startsWith("/api/") ||
        req.path === "/health"
      ) {
        next();
        return;
      }

      res.sendFile(path.join(frontendDirectory, "index.html"));
    });

    app.listen(port, "0.0.0.0", () => {
      console.log(`JobClose application is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start JobClose API:", error);
    await pool.end();
    process.exit(1);
  }
}

startServer();