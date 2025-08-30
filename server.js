import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import userAuthRoutes from "./routes/auth/userAuthRoute.js";
import adminAuthRoutes from "./routes/auth/adminAuthRoute.js";
import userRoutes from "./routes/userRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import publicRoutes from "./routes/publicRoute.js";

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Configure CORS
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Routes
app.use("/api/auth/user", userAuthRoutes);
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

// Test Route
app.get("/", (req, res) => res.send("Farwill Afcon Backend API is working... 🚀"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Farwill Afcon Backend running on port ${PORT}`));

// Handle uncaught errors
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
