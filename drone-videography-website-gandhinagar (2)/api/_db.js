import { MongoClient } from "mongodb";

/**
 * Shared MongoDB connection for the serverless functions.
 *
 * Required environment variables (set these in your host's dashboard):
 *   MONGODB_URI          e.g. mongodb+srv://user:pass@cluster.mongodb.net
 *   MONGODB_DB           optional, defaults to "arialfilmandreals"
 *   ADMIN_PASSWORD_SHA256  sha-256 of the admin password (see README note)
 *   ADMIN_SECRET         any long random string, used to sign session tokens
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.end(JSON.stringify(body));
}

export function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    json(res, 204, {});
    return true;
  }
  return false;
}
