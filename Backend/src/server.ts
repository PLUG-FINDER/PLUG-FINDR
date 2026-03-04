import http from "http";
import dotenv from "dotenv";
import { createApp } from "./app";
import { connectDB } from "./config/db";

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas first
    await connectDB();

    // Then create the Express app
    const app = await createApp();
    const server = http.createServer(app);

    server.listen(PORT, HOST, () => {
      console.log(`PlugFindr API running on http://${HOST}:${PORT}`);
      console.log(`Accessible from network at http://<your-ip>:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
};

startServer();
