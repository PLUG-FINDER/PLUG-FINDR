import express, { Application } from "express";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./config/db";
import { corsOptions } from "./config/cors";
import authRoutes from "./routes/authRoutes";
import vendorRoutes from "./routes/vendorRoutes";
import studentRoutes from "./routes/studentRoutes";
import adminRoutes from "./routes/adminRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import imageRoutes from "./routes/imageRoutes";
import aiRoutes from "./routes/aiRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { getPublicVendors } from "./controllers/studentController";

dotenv.config();

export const createApp = async (): Promise<Application> => {
  await connectDB();

  const app: Application = express();

  // Middleware
  app.use(morgan("dev"));
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Public routes (no authentication required)
  app.get("/api/public/vendors", getPublicVendors);

  // Routes - API routes first
  app.use("/api/auth", authRoutes);
  app.use("/api/vendor", vendorRoutes);
  app.use("/api/student", studentRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/images", imageRoutes); // Serve images from GridFS - must be before static routes

  // Static uploads directory (for backward compatibility with old images)
  const uploadsPath = path.join(__dirname, "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
};


