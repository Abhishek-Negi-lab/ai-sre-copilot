const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config({quiet: true});

const app = express();

const PORT = process.env.PORT || 5000;
const SERVICE_NAME = process.env.SERVICE_NAME || "ai-sre-backend";
const APP_VERSION = process.env.APP_VERSION || "1.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(cors());
app.use(express.json());

const incidents = [];

function log(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    message,
    ...meta,
  };

  console.log(JSON.stringify(logEntry));
}

app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;

    log("info", "HTTP request completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
});

app.get("/", (req, res) => {
  res.json({
    service: SERVICE_NAME,
    message: "AI SRE Copilot Backend API",
    status: "running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: SERVICE_NAME,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", (req, res) => {
  res.status(200).json({
    status: "ready",
    service: SERVICE_NAME,
    dependencies: {
      database: "not_configured_in_task_2",
      redis: "not_configured_in_task_2",
      aiAnalyzer: "not_configured_in_task_2",
    },
    timestamp: new Date().toISOString(),
  });
});

app.get("/version", (req, res) => {
  res.json({
    service: SERVICE_NAME,
    version: APP_VERSION,
    environment: NODE_ENV,
    nodeVersion: process.version,
  });
});

app.get("/api/incidents", (req, res) => {
  res.json({
    count: incidents.length,
    data: incidents,
  });
});

app.post("/api/incidents", (req, res) => {
  const { title, severity, serviceName, description } = req.body;

  if (!title || !severity || !serviceName) {
    return res.status(400).json({
      error: "Validation failed",
      message: "title, severity, and serviceName are required",
    });
  }

  const incident = {
    id: crypto.randomUUID(),
    title,
    severity,
    serviceName,
    description: description || "",
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  incidents.push(incident);

  log("warn", "New incident created", {
    incidentId: incident.id,
    severity: incident.severity,
    affectedService: incident.serviceName,
  });

  res.status(201).json(incident);
});

app.get("/api/incidents/:id", (req, res) => {
  const incident = incidents.find((item) => item.id === req.params.id);

  if (!incident) {
    return res.status(404).json({
      error: "Incident not found",
      incidentId: req.params.id,
    });
  }

  res.json(incident);
});

app.get("/simulate/error", (req, res) => {
  log("error", "Simulated production error triggered", {
    requestId: req.requestId,
  });

  res.status(500).json({
    error: "SimulatedInternalServerError",
    message: "This endpoint intentionally returns 500 for incident simulation",
  });
});

app.get("/simulate/slow", async (req, res) => {
  const delayMs = Number(req.query.delayMs || 3000);

  log("warn", "Simulated slow API request started", {
    requestId: req.requestId,
    delayMs,
  });

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  res.json({
    message: "Slow response completed",
    delayMs,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  log("error", "Unhandled application error", {
    requestId: req.requestId,
    errorMessage: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    error: "InternalServerError",
    message: "Something went wrong",
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  log("info", "Backend API server started", {
    port: PORT,
    environment: NODE_ENV,
    version: APP_VERSION,
  });
});

process.on("SIGTERM", () => {
  log("info", "SIGTERM received. Shutting down gracefully.");
  server.close(() => {
    log("info", "Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  log("info", "SIGINT received. Shutting down gracefully.");
  server.close(() => {
    log("info", "Server closed.");
    process.exit(0);
  });
});
