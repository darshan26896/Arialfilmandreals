import express from "express";

import authHandler from "./api/auth.js";
import libraryHandler from "./api/library.js";
import otpHandler from "./api/otp.js";

const app = express();

const PORT = process.env.PORT || 3000;

/* CORS */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use(express.json({ limit: "1mb" }));

/* API */
app.all("/api/auth", (req, res) => {
  void authHandler(req, res);
});

app.all("/api/library", (req, res) => {
  void libraryHandler(req, res);
});

app.all("/api/otp", (req, res) => {
  void otpHandler(req, res);
});

/* Health check */
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "arialfilmandreals-api",
  });
});

/* Start server */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Arialfilmandreals API listening on port ${PORT}`);
});