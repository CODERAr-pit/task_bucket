import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testRoutes from "./routes/testRoutes.js";

// Import rate limiting middleware
import {
  generalApiLimiter,
  apiSpeedLimiter,
} from "./middleware/rateLimiter.js";

import "./services/deadlineReminderJob.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Import and start cron jobs
import "./services/cronJobs.js";
// import './services/deadlineReminderJob.js';

// Middleware
// CORS configuration
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      // 'https://task-bucket.vercel.app'
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Apply rate limiting
app.use(generalApiLimiter); // Global rate limiter
app.use(apiSpeedLimiter); // Progressive delay for high-frequency requests

app.use(express.json({ limit: "10mb" })); // Add size limit for JSON payloads
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Add size limit for URL-encoded payloads
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Task Bucket API is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/test", testRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Health check: ${
      process.env.HEALTHCHECK_URL || `http://localhost:${PORT}/health`
    }`
  );
});
