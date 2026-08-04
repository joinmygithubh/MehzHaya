import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import compression from "compression";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import exchangeRoutes from "./routes/exchangeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

// Security & parsing
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

// Production & preview CORS Configuration
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.netlify\.app$/.test(origin) ||
        /\.onrender\.com$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to allow during deployment transition
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Global Rate limiting on all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/v1", apiLimiter);

// Strict Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many authentication requests, please try again later." },
});

// Health check endpoint for Render monitoring
app.get("/api/v1/health", (req, res) =>
  res.json({
    success: true,
    message: "MehzHaya API is running 🌿",
    environment: process.env.NODE_ENV || "development",
    time: new Date(),
  })
);

// Mount routes
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/returns", returnRoutes);
app.use("/api/v1/exchanges", exchangeRoutes);
app.use("/api/v1/admin/reports", reportRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
