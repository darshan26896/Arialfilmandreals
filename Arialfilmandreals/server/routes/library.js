import { getCollection, json, handleOptions } from "../lib/db.js";
import { verifyToken } from "./auth.js";

/**
 * Media library API
 *
 * GET    /api/library       Public: fetch library items
 * POST   /api/library       Admin: add or update an item
 * DELETE /api/library      Admin: delete an item
 *
 * MongoDB collection: library
 */

const DEFAULT_RATIO = "aspect-[4/3]";
const VALID_KINDS = new Set(["photo", "video"]);

function isValidHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeItem(body) {
  const kind = body.kind || "photo";

  if (!VALID_KINDS.has(kind)) {
    throw new Error('kind must be "photo" or "video"');
  }

  const item = {
    id: String(body.id || "").trim(),
    kind,
    title: String(body.title || "").trim(),
    place: String(body.place || "").trim(),
    meta: String(body.meta || "").trim(),
    img: String(body.img || "").trim(),
    video: String(body.video || "").trim(),
    tags: Array.isArray(body.tags)
      ? body.tags
          .filter((tag) => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [kind],
    ratio: String(body.ratio || DEFAULT_RATIO).trim(),
    createdAt: Date.now(),
  };

  if (!item.id || !item.title || !item.img) {
    throw new Error("id, title and img are required");
  }

  if (item.id.length > 150 || item.title.length > 300) {
    throw new Error("id or title is too long");
  }

  if (!isValidHttpUrl(item.img)) {
    throw new Error("img must be a valid HTTP or HTTPS URL");
  }

  if (item.video && !isValidHttpUrl(item.video)) {
    throw new Error("video must be a valid HTTP or HTTPS URL");
  }

  // Keep optional provider information for the frontend player.
  const allowedProviders = [
    "auto",
    "direct",
    "google-drive",
    "dropbox",
    "onedrive",
    "embed",
  ];

  if (allowedProviders.includes(body.videoProvider)) {
    item.videoProvider = body.videoProvider;
  }

  return item;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  try {
    const items = await getCollection("library");

    // Public library: newest entries first.
    if (req.method === "GET") {
      const docs = await items
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

      return json(res, 200, {
        ok: true,
        items: docs,
      });
    }

    // All write operations require an authenticated admin.
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");

    if (!token || !verifyToken(token)) {
      return json(res, 401, {
        ok: false,
        error: "Not authorised",
      });
    }

    if (req.method === "POST") {
      let item;

      try {
        item = normalizeItem(req.body || {});
      } catch (error) {
        return json(res, 400, {
          ok: false,
          error: error.message || "Invalid library item",
        });
      }

      // Preserve the original creation timestamp when updating an item.
      const existing = await items.findOne(
        { id: item.id },
        { projection: { _id: 0, createdAt: 1 } }
      );

      if (existing?.createdAt) {
        item.createdAt = existing.createdAt;
      }

      await items.updateOne(
        { id: item.id },
        { $set: item },
        { upsert: true }
      );

      return json(res, 200, {
        ok: true,
        item,
      });
    }

    if (req.method === "DELETE") {
      const body = req.body || {};
      const id = String(body.id || req.query?.id || "").trim();

      if (!id) {
        return json(res, 400, {
          ok: false,
          error: "id is required",
        });
      }

      const result = await items.deleteOne({ id });

      return json(res, 200, {
        ok: true,
        deleted: result.deletedCount > 0,
      });
    }

    res.setHeader("Allow", "GET, POST, DELETE, OPTIONS");

    return json(res, 405, {
      ok: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Library API error:", error);

    return json(res, 500, {
      ok: false,
      error: "Database error",
    });
  }
}