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
 *   POST   /api/auth      status | setup | change | login
 *   GET    /api/library   public library list
 *   POST   /api/library   add an item            (session token required)
 *   DELETE /api/library   remove an item         (session token required)
 *   POST   /api/otp       send | verify email codes
 */

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authHandler from "./routes/auth.js";
import libraryHandler from "./routes/library.js";
import otpHandler from "./routes/otp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

/* CORS — the website may be hosted elsewhere (e.g. GitHub Pages) */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "arialfilmandreals-api" }),
);

app.all("/api/auth", (req, res) => void authHandler(req, res));
app.all("/api/library", (req, res) => void libraryHandler(req, res));
app.all("/api/otp", (req, res) => void otpHandler(req, res));

