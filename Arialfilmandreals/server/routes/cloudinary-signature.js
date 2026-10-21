
import express from "express";
import crypto from "node:crypto";
import { getSessionToken, verifyToken } from "./auth.js";


const router = express.Router();

router.post("/", (req, res) => {
  const token = getSessionToken(req);

  if (!token || !verifyToken(token)) {
    return res.status(401).json({
      ok: false,
      error: "Not authorised",
    });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({
      ok: false,
      error: "Cloudinary environment variables are not configured",
    });
  }

  const resourceType = req.body?.resourceType;

  if (!["image", "video"].includes(resourceType)) {
    return res.status(400).json({
      ok: false,
      error: "resourceType must be image or video",
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "aerial-film-reel";

  // Cloudinary signature: SHA-1 of sorted parameters + API secret.
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return res.json({
    ok: true,
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    resourceType,
  });
});

export default router;
