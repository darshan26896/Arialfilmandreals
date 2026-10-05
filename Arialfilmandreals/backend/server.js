import express from "express";

import authHandler from "./api/auth.js";
import libraryHandler from "./api/library.js";
import otpHandler from "./api/otp.js";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

/* CORS */
app.use((req, res, next) => {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    "https://darshan26896.github.io";

  res.setHeader(
    "Access-Control-Allow-Origin",
    frontendUrl
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

/* JSON */
app.use(
  express.json({
    limit: "1mb"
  })
);

/* Health check */
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "arialfilmandreals-backend",
    status: "online"
  });
});

/* Authentication */
app.all("/api/auth", async (req, res) => {
  try {
    await authHandler(req, res);
  } catch (error) {
    console.error("AUTH ERROR:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Authentication server error"
      });
    }
  }
});

/* Library */
app.all("/api/library", async (req, res) => {
  try {
    await libraryHandler(req, res);
  } catch (error) {
    console.error("LIBRARY ERROR:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Library server error"
      });
    }
  }
});

/* OTP */
app.all("/api/otp", async (req, res) => {
  try {
    await otpHandler(req, res);
  } catch (error) {
    console.error("OTP ERROR:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "OTP server error"
      });
    }
  }
});

/* Unknown API */
app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found"
  });
});

/* Global error */
app.use((error, _req, res, _next) => {
  console.error("SERVER ERROR:", error);

  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

/* Start */
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Arialfilmandreals backend running on port ${PORT}`
  );
});