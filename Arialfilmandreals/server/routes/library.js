```javascript
import crypto from "node:crypto";
import { getCollection, json, handleOptions } from "../lib/db.js";
import { verifyToken } from "./auth.js";

const DEFAULT_RATIO = "aspect-[4/3]";
const ALLOWED_KINDS = new Set(["photo", "video"]);
const ALLOWED_TAGS = new Set([
  "video",
  "photo",
  "reels",
  "property",
  "events",
  "heritage",
]);

function cleanString(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validMediaUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normaliseItem(body, existing = {}) {
  const kind = body.kind ?? existing.kind ?? "photo";
  const title = cleanString(body.title ?? existing.title, 200);
  const img = cleanString(body.img ?? existing.img, 2000);
  const video = cleanString(body.video ?? existing.video, 2000);

  if (!ALLOWED_KINDS.has(kind)) {
    throw new Error("kind must be photo or video");
  }

  if (!title) {
    throw new Error("title is required");
  }

  if (!validMediaUrl(img)) {
    throw new Error("img must be a valid HTTP or HTTPS URL");
  }

  if (video && !validMediaUrl(video)) {
    throw new Error("video must be a valid HTTP or HTTPS URL");
  }

  if (kind === "video" && !video) {
    throw new Error("video URL is required for video items");
  }

  const rawTags = Array.isArray(body.tags)
    ? body.tags
    : existing.tags;

  const tags = Array.isArray(rawTags)
    ? [...new Set(
        rawTags
          .filter((tag) => typeof tag === "string")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => ALLOWED_TAGS.has(tag)),
      )]
    : [kind];

  return {
    kind,
    title,
    place: cleanString(body.place ?? existing.place, 200),
    meta: cleanString(body.meta ?? existing.meta, 300),
    img,
    video: kind === "video" ? video : "",
    tags: tags.length ? tags : [kind],
    ratio: cleanString(body.ratio ?? existing.ratio, 100) || DEFAULT_RATIO,
  };
}

/** Public GET; admin token required for POST, PUT and DELETE. */
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  try {
    const collection = await getCollection("library");

    if (req.method === "GET") {
      const docs = await collection
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

      return json(res, 200, { ok: true, items: docs });
    }

    const authorization = req.headers.authorization || "";
    const token = authorization.replace(/^Bearer\s+/i, "");

    if (!token || !verifyToken(token)) {
      return json(res, 401, { ok: false, error: "Not authorised" });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const id = cleanString(body.id, 100) || crypto.randomUUID();

      let data;

      try {
        data = normaliseItem(body);
      } catch (error) {
        return json(res, 400, {
          ok: false,
          error: error.message,
        });
      }

      const now = Date.now();

      await collection.updateOne(
        { id },
        {
          $set: {
            id,
            ...data,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      );

      return json(res, 200, {
        ok: true,
        id,
      });
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      const id = cleanString(body.id, 100);

      if (!id) {
        return json(res, 400, {
          ok: false,
          error: "id is required",
        });
      }

      const existing = await collection.findOne(
        { id },
        { projection: { _id: 0 } },
      );

      if (!existing) {
        return json(res, 404, {
          ok: false,
          error: "Library item not found",
        });
      }

      let data;

      try {
        data = normaliseItem(body, existing);
      } catch (error) {
        return json(res, 400, {
          ok: false,
          error: error.message,
        });
      }

      await collection.updateOne(
        { id },
        {
          $set: {
            ...data,
            updatedAt: Date.now(),
          },
        },
      );

      return json(res, 200, {
        ok: true,
        id,
      });
    }

    if (req.method === "DELETE") {
      const id = cleanString(
        (req.body && req.body.id) || req.query?.id,
        100,
      );

      if (!id) {
        return json(res, 400, {
          ok: false,
          error: "id is required",
        });
      }

      const result = await collection.deleteOne({ id });

      if (!result.deletedCount) {
        return json(res, 404, {
          ok: false,
          error: "Library item not found",
        });
      }

      return json(res, 200, { ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE, OPTIONS");

    return json(res, 405, {
      ok: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Library API error:", error);

    return json(res, 500, {
      ok: false,
      error: "Library operation failed",
    });
  }
}
```
