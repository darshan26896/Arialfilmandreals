
import crypto from "node:crypto";
import { getCollection, json, handleOptions } from "../lib/db.js";
import { issueToken } from "./auth.js";

const sha = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

async function sendEmail(to, code) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      error: "RESEND_API_KEY is not configured on Render.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.OTP_FROM ||
          "Aerial Film & Reel Studio <onboarding@resend.dev>",
        to: [to],
        subject: "Aerial Film & Reel Studio — Admin Login Code",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
            <h2>Admin Login Verification</h2>
            <p>Use this code to complete your admin login:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px">
              ${code}
            </div>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this code, ignore this email.</p>
          </div>
        `,
        text: `Your admin login code is ${code}. It expires in 10 minutes.`,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Resend email error:", {
        status: response.status,
        message: result.message || result.error || "Email request failed",
      });

      return {
        ok: false,
        error:
          result.message ||
          result.error ||
          `Resend returned HTTP ${response.status}`,
      };
    }

    if (!result.id) {
      return {
        ok: false,
        error: "Resend did not return an email ID.",
      };
    }

    console.log("Resend accepted OTP email:", result.id);

    return { ok: true, id: result.id };
  } catch (error) {
    console.error("Resend request failed:", String(error));

    return {
      ok: false,
      error: "Could not connect to the email service.",
    };
  }
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const action = body.action;

  // Always use the configured admin email.
  // Never allow a client to choose the OTP recipient.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    return json(res, 500, {
      ok: false,
      error: "ADMIN_EMAIL is not configured on Render.",
    });
  }

  try {
    const store = await getCollection("otp");

    if (action === "send") {
      const otp = String(crypto.randomInt(100000, 1000000));
      const now = Date.now();

      // Remove previous codes for this admin.
      await store.deleteMany({ email });

      const inserted = await store.insertOne({
        email,
        hash: sha(otp),
        expires: now + OTP_EXPIRY_MS,
        tries: 0,
        createdAt: now,
      });

      const delivery = await sendEmail(email, otp);

      if (!delivery.ok) {
        // Do not leave an unusable code in the database.
        await store.deleteOne({ _id: inserted.insertedId });

        return json(res, 502, {
          ok: false,
          sent: false,
          error: delivery.error,
        });
      }

      return json(res, 200, {
        ok: true,
        sent: true,
        message: "Email accepted by Resend.",
      });
    }

    if (action === "verify") {
      const code = String(body.code || "").trim();

      if (!/^\d{6}$/.test(code)) {
        return json(res, 400, {
          ok: false,
          error: "Enter the 6-digit verification code.",
        });
      }

      const doc = await store.findOne({ email });

      if (!doc || doc.expires <= Date.now()) {
        if (doc) {
          await store.deleteOne({ _id: doc._id });
        }

        return json(res, 401, {
          ok: false,
          error: "Code expired. Request a new one.",
        });
      }

      if (doc.tries >= MAX_ATTEMPTS) {
        return json(res, 429, {
          ok: false,
          error: "Too many attempts. Request a new code.",
        });
      }

      await store.updateOne(
        { _id: doc._id },
        { $inc: { tries: 1 } }
      );

      const submittedHash = Buffer.from(sha(code), "hex");
      const storedHash = Buffer.from(doc.hash, "hex");

      const valid =
        submittedHash.length === storedHash.length &&
        crypto.timingSafeEqual(submittedHash, storedHash);

      if (!valid) {
        return json(res, 401, {
          ok: false,
          error: "Incorrect verification code.",
        });
      }

      await store.deleteOne({ _id: doc._id });

      return json(res, 200, {
        ok: true,
        token: issueToken(),
      });
    }

    return json(res, 400, {
      ok: false,
      error: "Unknown action.",
    });
  } catch (error) {
    console.error("OTP handler error:", String(error));

    return json(res, 500, {
      ok: false,
      error: "OTP service failed. Check the Render logs.",
    });
  }
}