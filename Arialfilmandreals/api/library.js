import { getCollection, json, handleOptions } from "./_db.js";
import { verifyToken } from "./auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "");

  try {
    const items = await getCollection("library");

    /* ---------- read (public) ---------- */
    if (req.method === "GET") {
      const docs = await items
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      return json(res, 200, { ok: true, items: docs });
    }

    /* ---------- everything else needs the admin token ---------- */
    if (!verifyToken(token)) {
      return json(res, 401, { error: "Not authorised" });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      if (!body.id || !body.title || !body.img) {
        return json(res, 400, { error: "id, title and img are required" });
      }
      await items.updateOne(
        { id: body.id },
        {
          $set: {
            id: body.id,
            kind: body.kind || "photo",
            title: body.title,
            place: body.place || "",
            meta: body.meta || "",
            img: body.img,
            video: body.video || "",
            tags: Array.isArray(body.tags) ? body.tags : ["photo"],
            ratio: body.ratio || "aspect-[4/3]",
            createdAt: Date.now(),
          },
        },
        { upsert: true },
      );
      return json(res, 200, { ok: true });
    }

    if (req.method === "DELETE") {
      const id = (req.body && req.body.id) || req.query.id;
      if (!id) return json(res, 400, { error: "id is required" });
      await items.deleteOne({ id });
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (err) {
    return json(res, 500, { error: "Database error", detail: String(err) });
  }
}
