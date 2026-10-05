import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();

app.use(cors({
  origin: [
    "https://darshan26896.github.io"
  ],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 10000;

const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
  try {
    await client.connect();

    console.log("MongoDB connected successfully");

    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "arialfilmandreals API is running"
      });
    });

    // Your API routes go here
    // app.use("/api/auth", authRoutes);
    // app.use("/api/library", libraryRoutes);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`arialfilmandreals API listening on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

startServer();