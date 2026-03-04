import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

// Load environment variables from .env file
dotenv.config();

// Use only MONGODB_URI from environment
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("[db] ❌ MONGODB_URI not found in environment variables. Please set it in your .env file.");
  process.exit(1);
}

export const connectDB = async (): Promise<void> => {
  try {
    console.log("[db] 🔗 Connecting to MongoDB Atlas...");
    // Ensure Node uses reliable DNS servers for SRV lookups (workaround for
    // environments where the system DNS causes `querySrv ECONNREFUSED`).
    try {
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
      console.log("[db] ℹ️  DNS servers set to Google DNS for SRV resolution");
    } catch (dnsErr) {
      console.warn("[db] ⚠️  Failed to set custom DNS servers:", dnsErr);
    }
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
