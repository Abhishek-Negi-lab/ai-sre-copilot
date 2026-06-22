const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { query, checkDatabase, closeDatabase } = require("./db");

dotenv.config({ quiet: true });

const app = express();

const PORT = process.env.PORT || 5000;
const SERVICE_NAME = process.env.SERVICE_NAME || "ai-sre-backend";
const APP_VERSION = process.env.APP_VERSION || "1.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(cors());
app.use(express.json());

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

function mapIncident(row) {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity,
    serviceName: row.service_name,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

app.get("/ready", async (req, res) => {
  try {
    const database = await checkDatabase();

    res.status(200).json({
      status: "ready",
      service: SERVICE_NAME,
      dependencies: {
        database,
        redis: "not_configured_in_task_3",
        aiAnalyzer: "not_configured_in_task_3",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log("error", "Readiness check failed", {
      requestId: req.requestId,
      dependency: "database",
      errorMessage: error.message,
    });

    res.status(503).json({
      status: "not_ready",
      service: SERVICE_NAME,
      dependencies: {
        database: {
          status: "disconnected",
          error: error.message,
        },
      },
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/version", (req, res) => {
  res.json({
    service: SERVICE_NAME,
    version: APP_VERSION,
    environment: NODE_ENV,
    nodeVersion: process.version,
  });
});

app.get("/api/incidents", async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, title, severity, service_name, description, status, created_at, updated_at
       FROM incidents
       ORDER BY created_at DESC`
    );

    res.json({
      count: result.rows.length,
      data: result.rows.map(mapIncident),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/incidents", async (req, res, next) => {
  try {
    const { title, severity, serviceName, description } = req.body;

    if (!title || !severity || !serviceName) {
      return res.status(400).json({
        error: "Validation failed",
        message: "title, severity, and serviceName are required",
      });
    }

    const incidentId = crypto.randomUUID();

    const result = await query(
      `INSERT INTO incidents (id, title, severity, service_name, description, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, severity, service_name, description, status, created_at, updated_at`,
      [incidentId, title, severity, serviceName, description || "", "open"]
    );

    const incident = mapIncident(result.rows[0]);

    log("warn", "New incident created", {
      incidentId: incident.id,
      severity: incident.severity,
      affectedService: incident.serviceName,
    });

    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
});

app.get("/api/incidents/:id", async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, title, severity, service_name, description, status, created_at, updated_at
       FROM incidents
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Incident not found",
        incidentId: req.params.id,
      });
    }

    res.json(mapIncident(result.rows[0]));
  } catch (error) {
    next(error);
  }
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

async function shutdown(signal) {
  log("info", `${signal} received. Shutting down gracefully.`);

  server.close(async () => {
    try {
      await closeDatabase();
      log("info", "Database pool closed.");
      log("info", "Server closed.");
      process.exit(0);
    } catch (error) {
      log("error", "Error during shutdown", {
        errorMessage: error.message,
      });
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
