import crypto from "node:crypto";
import { getCollection, json, handleOptions } from "../lib/db.js";

/**
 * MongoDB authentication — the admin password lives ONLY in the database.
 *
 *   action: "status"  → is a password configured yet?
 *   action: "setup"   → first-time password creation (needs the setup key)
 *   action: "change"  → change the password (needs the current one)
 *   action: "login"   → verify and issue a session token
 *
 * Environment variables:
 *   MONGODB_URI, MONGODB_DB
 *   ADMIN_SETUP_KEY   required for the one-time setup
 *   ADMIN_SECRET      signs session tokens
 */

const sha = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

export function issueToken() {
  const secret = process.env.ADMIN_SECRET || "set-a-long-random-admin-secret";
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const sig = crypto.createHmac("sha256", secret).update(String(exp)).digest("hex");
  return `${exp}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const [exp, sig] = String(token).split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const secret = process.env.ADMIN_SECRET || "set-a-long-random-admin-secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(String(exp))
    .digest("hex");
  return safeEqual(sig, expected);
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const body = req.body || {};
  const action = body.action || "login";

  try {
    const admin = await getCollection("admin");
    const doc = await admin.findOne({ _id: "password" });

    if (action === "status") {
      return json(res, 200, { ok: true, configured: Boolean(doc) });
    }

    if (action === "setup") {
      if (doc) return json(res, 409, { error: "A password is already configured" });

      const key = process.env.ADMIN_SETUP_KEY;
      if (!key || !safeEqual(String(body.setupKey || ""), String(key))) {
        return json(res, 403, { error: "Setup key required" });
      }
      if (!body.password || String(body.password).length < 12) {
        return json(res, 400, { error: "Password must be at least 12 characters" });
      }

      await admin.insertOne({
        _id: "password",
        hash: sha(body.password),
        createdAt: Date.now(),
      });
      return json(res, 200, { ok: true, token: issueToken() });
    }

    if (action === "change") {
      if (!doc) return json(res, 409, { error: "Not configured" });
      if (!safeEqual(sha(body.current || ""), doc.hash)) {
        return json(res, 401, { error: "Current password is wrong" });
      }
      if (!body.password || String(body.password).length < 12) {
        return json(res, 400, { error: "Password must be at least 12 characters" });
      }
      await admin.updateOne(
        { _id: "password" },
        { $set: { hash: sha(body.password), changedAt: Date.now() } },
      );
      return json(res, 200, { ok: true, token: issueToken() });
    }

    if (!doc) return json(res, 409, { error: "Not configured yet" });
    if (!safeEqual(sha(body.password || ""), doc.hash)) {
      return json(res, 401, { error: "Wrong password" });
    }
    return json(res, 200, { ok: true, token: issueToken() });
  } catch (err) {
    return json(res, 500, { error: "Database error", detail: String(err) });
  }
}
