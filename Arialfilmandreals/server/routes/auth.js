import crypto from "node:crypto";
import { getCollection, json, handleOptions } from "../lib/db.js";

export const SESSION_COOKIE = "afm_admin_session";
export const CHALLENGE_COOKIE = "afm_admin_challenge";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const CHALLENGE_TTL_MS = 10 * 60 * 1000;

const sha = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

function secret() {
  const value = process.env.ADMIN_SECRET;
  if (!value || value.length < 32) {
    throw new Error("ADMIN_SECRET must be configured with at least 32 characters");
  }
  return value;
}

function signedExpiry(exp, purpose) {
  return crypto.createHmac("sha256", secret()).update(`${purpose}:${exp}`).digest("hex");
}

function verifySignedExpiry(token, purpose) {
  if (!token || typeof token !== "string") return false;
  const [exp, sig, extra] = token.split(".");
  if (extra !== undefined || !/^\d+$/.test(exp || "") || !/^[a-f0-9]{64}$/i.test(sig || "")) return false;
  if (Number(exp) <= Date.now()) return false;
  try {
    return safeEqual(sig, signedExpiry(exp, purpose));
  } catch {
    return false;
  }
}

export function issueToken() {
  const exp = Date.now() + SESSION_TTL_MS;
  return `${exp}.${signedExpiry(exp, "session")}`;
}

export function verifyToken(token) {
  return verifySignedExpiry(token, "session");
}

export function issueChallengeToken() {
  const exp = Date.now() + CHALLENGE_TTL_MS;
  return `${exp}.${signedExpiry(exp, "otp-challenge")}`;
}

export function verifyChallengeToken(token) {
  return verifySignedExpiry(token, "otp-challenge");
}

function getCookie(req, cookieName) {
  const cookieHeader = req.headers?.cookie || "";
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const name = part.slice(0, separator).trim();
    if (name === cookieName) {
      const value = part.slice(separator + 1).trim();
      try { return decodeURIComponent(value); } catch { return ""; }
    }
  }
  return "";
}

export function getSessionToken(req) {
  return getCookie(req, SESSION_COOKIE);
}

export function getChallengeToken(req) {
  return getCookie(req, CHALLENGE_COOKIE);
}

function appendCookie(res, cookie) {
  const current = res.getHeader("Set-Cookie");
  if (!current) res.setHeader("Set-Cookie", cookie);
  else if (Array.isArray(current)) res.setHeader("Set-Cookie", [...current, cookie]);
  else res.setHeader("Set-Cookie", [current, cookie]);
}

export function setSessionCookie(res, token) {
  appendCookie(res, `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; HttpOnly; Secure; SameSite=Lax`);
}

export function clearSessionCookie(res) {
  appendCookie(res, `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

export function setChallengeCookie(res, token) {
  appendCookie(res, `${CHALLENGE_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.floor(CHALLENGE_TTL_MS / 1000)}; HttpOnly; Secure; SameSite=Lax`);
}

export function clearChallengeCookie(res) {
  appendCookie(res, `${CHALLENGE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

export function isOtpRequired() {
  return process.env.OTP_ENABLED !== "false";
}

function finishPasswordProof(res) {
  if (isOtpRequired()) {
    setChallengeCookie(res, issueChallengeToken());
    return json(res, 200, { ok: true, requiresOtp: true });
  }
  clearChallengeCookie(res);
  setSessionCookie(res, issueToken());
  return json(res, 200, { ok: true, authenticated: true });
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });

  const body = req.body || {};
  const action = String(body.action || "").trim().toLowerCase();

  if (action === "session") {
    const token = getSessionToken(req);
    if (!verifyToken(token)) {
      clearSessionCookie(res);
      return json(res, 401, { ok: false, authenticated: false, error: "Session expired" });
    }
    const expiresAt = Number(token.split(".")[0]);
    return json(res, 200, { ok: true, authenticated: true, expiresAt });
  }

  if (action === "logout") {
    clearSessionCookie(res);
    clearChallengeCookie(res);
    return json(res, 200, { ok: true, authenticated: false });
  }

  if (!["status", "setup", "change", "login"].includes(action)) {
    return json(res, 400, {
      ok: false,
      error: action ? "Invalid action" : "action is required",
      allowedActions: ["status", "setup", "change", "login", "session", "logout"],
    });
  }

  try {
    const admin = await getCollection("admin");
    const doc = await admin.findOne({ _id: "password" });

    if (action === "status") {
      return json(res, 200, { ok: true, configured: Boolean(doc) });
    }

    if (action === "setup") {
      if (doc) return json(res, 409, { ok: false, error: "A password is already configured" });
      const key = process.env.ADMIN_SETUP_KEY;
      if (!key) return json(res, 500, { ok: false, error: "ADMIN_SETUP_KEY is not configured on the server" });
      if (!safeEqual(String(body.setupKey || ""), key)) return json(res, 403, { ok: false, error: "Setup key required" });
      if (!body.password || String(body.password).length < 12) {
        return json(res, 400, { ok: false, error: "Password must be at least 12 characters" });
      }
      await admin.insertOne({ _id: "password", hash: sha(body.password), createdAt: Date.now() });
      return finishPasswordProof(res);
    }

    if (action === "change") {
      if (!doc) return json(res, 409, { ok: false, error: "Not configured" });
      if (!safeEqual(sha(body.current || ""), doc.hash)) {
        return json(res, 401, { ok: false, error: "Current password is wrong" });
      }
      if (!body.password || String(body.password).length < 12) {
        return json(res, 400, { ok: false, error: "Password must be at least 12 characters" });
      }
      await admin.updateOne({ _id: "password" }, { $set: { hash: sha(body.password), changedAt: Date.now() } });
      clearSessionCookie(res);
      clearChallengeCookie(res);
      return json(res, 200, { ok: true, authenticated: false, message: "Password changed. Please sign in again." });
    }

    if (!doc) return json(res, 409, { ok: false, error: "Not configured yet" });
    if (!safeEqual(sha(body.password || ""), doc.hash)) {
      return json(res, 401, { ok: false, error: "Wrong password" });
    }
    return finishPasswordProof(res);
  } catch (err) {
    console.error("Authentication error:", err);
    return json(res, 500, { ok: false, error: "Authentication service failed" });
  }
}
