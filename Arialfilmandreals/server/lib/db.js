import { MongoClient } from "mongodb";

/**
 * Shared MongoDB connection.
 *
 * Required environment variables:
 *   MONGODB_URI      mongodb+srv://USER:PASS@cluster.mongodb.net
 *   MONGODB_DB       optional, defaults to "arialfilmandreals"
 */

let clientPromise = null;

export function getCollection(name) {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!clientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 5 });
    clientPromise = client.connect();
  }
  return clientPromise
    .then((c) =>
      c.db(process.env.MONGODB_DB || "arialfilmandreals").collection(name),
    )
    .catch((err) => {
      clientPromise = null;
      throw err;
    });
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
