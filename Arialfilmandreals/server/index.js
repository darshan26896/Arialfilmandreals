/**
 * arialfilmandreals — backend server
 *
 * A standalone Node service. Deploy it from the `server/` folder on Render:
 *
 *   Root Directory   server
 *   Build Command    npm install
 *   Start Command    npm start
 *
 * Routes
 *   GET    /api/health    liveness check
 *   POST   /api/auth      status | setup | change | login | session | logout
 *   GET    /api/library   public library list
 *   POST   /api/library   add an item            (HttpOnly admin cookie required)
 *   DELETE /api/library   remove an item         (HttpOnly admin cookie required)
 *   POST   /api/otp       send | verify email codes
 */

import express from "express";

import { getCollection } from "./lib/db.js";
import authHandler from "./routes/auth.js";
import libraryHandler from "./routes/library.js";
import otpHandler from "./routes/otp.js";
import cloudinarySignatureHandler from "./routes/cloudinary-signature.js";

const PORT = process.env.PORT || 3000;

const app = express();

/* Credentialed CORS for optional direct API access. In production, the Vercel
 * /api rewrite keeps browser requests same-origin and avoids third-party-cookie blocking.
 * Set FRONTEND_ORIGINS to a comma-separated list if direct cross-origin access is needed. */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",").map((value) => value.trim()).filter(Boolean);

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.use(express.json({ limit: "1mb" }));

/* Request logging */
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

/* Backend status */
app.get("/", (_req, res) =>
  res.json({
    ok: true,
    service: "arialfilmandreals-api",
    status: "online",
    frontend: "Vercel",
    backend: "Render",
    database: "MongoDB Atlas",
  }),
);

/* Health check */
app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    service: "arialfilmandreals-api",
  }),
);

/* MongoDB connection test */
app.get("/api/db-test", async (_req, res) => {
  try {
    const collection = await getCollection("library");

    await collection.findOne({});

    res.json({
      ok: true,
      database: "connected",
    });
  } catch (err) {
    console.error("MongoDB connection test failed:", err);

    res.status(500).json({
      ok: false,
      database: "not connected",
      error: err.message,
    });
  }
});

/* Authentication */
app.all("/api/auth", async (req, res) => {
  try {
    await authHandler(req, res);
  } catch (err) {
    console.error("Auth API error:", err);

    if (!res.headersSent) {
      res.status(500).json({
        ok: false,
        error: "Internal server error",
      });
    }
  }
});

/* Library */
app.all("/api/library", async (req, res) => {
  try {
    await libraryHandler(req, res);
  } catch (err) {
    console.error("Library API error:", err);

    if (!res.headersSent) {
      res.status(500).json({
        ok: false,
        error: "Internal server error",
      });
    }
  }
});

/* OTP */
app.all("/api/otp", async (req, res) => {
  try {
    await otpHandler(req, res);
  } catch (err) {
    console.error("OTP API error:", err);

    if (!res.headersSent) {
      res.status(500).json({
        ok: false,
        error: "Internal server error",
      });
    }
  }
});

app.use(
  "/api/cloudinary-signature",
  cloudinarySignatureHandler
);

/* Unknown API route */
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "API route not found",
    path: req.originalUrl,
  });
});

/* Global error handler */
app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);

  if (!res.headersSent) {
    res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

/* Start server */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`arialfilmandreals API listening on port ${PORT}`);
});
