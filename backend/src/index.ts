import "dotenv/config";
import morgan from "morgan";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { testConnection } from "./database";
import testStripRoutes from "./routes/testStripRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// Test database connection on startup
testConnection();

// Middleware
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images and thumbnails)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/test-strips", testStripRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
