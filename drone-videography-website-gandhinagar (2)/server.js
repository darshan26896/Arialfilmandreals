/**
 * Render (or any Node host) entry point.
 *
 * Serves the built site from ./dist and mounts the same API handlers the
 * serverless platform uses, so nothing has to be rewritten:
 *
 *   POST   /api/auth     password login        → session token
 *   GET    /api/library  public library list
 *   POST   /api/library  add an item           (token required)
 *   DELETE /api/library  remove an item        (token required)
 *   POST   /api/otp      send / verify email codes
 *
 * Start command on Render:  node server.js
 */

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authHandler from "./api/auth.js";
import libraryHandler from "./api/library.js";
import otpHandler from "./api/otp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

/* CORS — needed while the site is on GitHub Pages and the API on Render */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.use(express.json({ limit: "1mb" }));

/* ---- API ---- */
app.all("/api/auth", (req, res) => void authHandler(req, res));
app.all("/api/library", (req, res) => void libraryHandler(req, res));
app.all("/api/otp", (req, res) => void otpHandler(req, res));

/* ---- built site ---- */
app.use(express.static(path.join(__dirname, "dist")));

app.use((_req, res) =>
  res.sendFile(path.join(__dirname, "dist", "index.html")),
);

app.listen(PORT, () => {
  console.log(`arialfilmandreals listening on port ${PORT}`);
});
