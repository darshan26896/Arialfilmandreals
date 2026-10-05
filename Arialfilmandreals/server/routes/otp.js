import crypto from "node:crypto";
import { getCollection, json, handleOptions } from "../lib/db.js";
import { issueToken } from "./auth.js";

/**
 * Two-step login codes.
 *
 *   action: "send"   → generates a 6-digit code, hashed in MongoDB for 10 min
 *   action: "verify" → checks the code and returns a session token
 *
 * Environment variables:
 *   ADMIN_EMAIL     where the code is sent
 *   RESEND_API_KEY  optional — real email delivery via Resend
 *   OTP_FROM        optional — verified sender address
 */

const sha = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

async function sendEmail(to, code) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.OTP_FROM || "onboarding@resend.dev",
      to: [to],
      subject: `Your admin login code — ${code}`,
      html: `<p style="font-family:sans-serif">Your admin login code is</p>
             <p style="font-family:monospace;font-size:28px;letter-spacing:6px"><b>${code}</b></p>
             <p style="font-family:sans-serif;color:#666">It expires in 10 minutes. If you did not request this, ignore this email.</p>`,
    }),
  });
  return res.ok;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const body = req.body || {};
  const action = body.action;
  const email = process.env.ADMIN_EMAIL || body.email;

  if (!email) return json(res, 400, { error: "No email configured" });

  try {
    const store = await getCollection("otp");

    if (action === "send") {
      const otp = String(crypto.randomInt(100000, 999999));
      await store.deleteMany({ email });
      await store.insertOne({
        email,
        hash: sha(otp),
        expires: Date.now() + 10 * 60 * 1000,
        tries: 0,
        createdAt: Date.now(),
      });
      const sent = await sendEmail(email, otp);
      return json(res, 200, { ok: true, sent });
    }

    if (action === "verify") {
      const doc = await store.findOne({ email });
      if (!doc || doc.expires < Date.now()) {
        return json(res, 401, { error: "Code expired — request a new one" });
      }
      if (doc.tries >= 5) {
        return json(res, 429, { error: "Too many attempts — request a new code" });
      }
      await store.updateOne({ _id: doc._id }, { $inc: { tries: 1 } });

      if (!body.code || sha(body.code) !== doc.hash) {
        return json(res, 401, { error: "Wrong code" });
      }

      await store.deleteOne({ _id: doc._id });
      return json(res, 200, { ok: true, token: issueToken() });
    }

    return json(res, 400, { error: "Unknown action" });
  } catch (err) {
    return json(res, 500, { error: "Database error", detail: String(err) });
  }
}
