import express from "express";

const app = express();

const port = Number(process.env.PORT) || 3000;

// Parse incoming JSON requests.
app.use(express.json());

// Health endpoint for local testing and future ECS health checks.
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the application.
app.listen(port, "0.0.0.0", () => {
  console.log(`JobClose API is running on port ${port}`);
});
