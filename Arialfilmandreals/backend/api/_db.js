
import { MongoClient } from "mongodb";

/**
 * Shared MongoDB connection for serverless functions.
 *
 * Configure these environment variables in Render:
 *
 * MONGODB_URI=mongodb+srv:mongodb+srv://ubuntu:rfZtKIWUWgXTOzEG@cluster0.9tuabok.mongodb.net/
 * MONGODB_DB=arialfilmandreals
 * ADMIN_PASSWORD_SHA256=9afe0166073e77948583147da0e3fe05925cdc1495b08e0a3153a7c36dea5b6c
 * ADMIN_SECRET=7160cacd61e340f81c6b285e844701e9514fc3acf547d9d548e5ff6003e06b483e1ede7c69e390dec0d1b29c27f5d1f7
 * ADMIN_EMAIL=joysolanki055@gmail.com
 */

let clientPromise = null;

export function getCollection(name) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });

    clientPromise = client.connect();
  }

  return clientPromise
    .then((client) => {
      const db = client.db(
        process.env.MONGODB_DB || "arialfilmandreals"
      );

      return db.collection(name);
    })
    .catch((error) => {
      clientPromise = null;
      console.error("MongoDB connection failed:", error.message);
      throw error;
    });
}

/**
 * Send a JSON response.
 */
export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");

  // Replace "*" with your actual frontend URL in production.
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL || "*"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS"
  );

  res.end(status === 204 ? "" : JSON.stringify(body));
}

/**
 * Handle browser CORS preflight requests.
 */
export function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return true;
  }

  return false;
}