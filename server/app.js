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

// Security & parsing middleware
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
        /\.onrender\.com$/.test(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"), false);
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Global Rate limiting on all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(["/api/v1", "/api"], apiLimiter);

// Strict Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many authentication requests, please try again later." },
});

// Root Health Check Route
app.get("/", (req, res) =>
  res.status(200).json({
    success: true,
    message: "MehzHaya API running",
    environment: process.env.NODE_ENV || "development",
  })
);

// API Health check endpoints
app.get(["/api/v1/health", "/api/health"], (req, res) =>
  res.status(200).json({
    success: true,
    message: "MehzHaya API running",
    environment: process.env.NODE_ENV || "development",
    time: new Date(),
  })
);

// Mount API routes (supports both /api/v1/... and /api/... endpoints)
app.use(["/api/v1/auth", "/api/auth"], authLimiter, authRoutes);
app.use(["/api/v1/users", "/api/users"], userRoutes);
app.use(["/api/v1/products", "/api/products"], productRoutes);
app.use(["/api/v1/categories", "/api/categories"], categoryRoutes);
app.use(["/api/v1/cart", "/api/cart"], cartRoutes);
app.use(["/api/v1/wishlist", "/api/wishlist"], wishlistRoutes);
app.use(["/api/v1/orders", "/api/orders"], orderRoutes);
app.use(["/api/v1/reviews", "/api/reviews"], reviewRoutes);
app.use(["/api/v1/coupons", "/api/coupons"], couponRoutes);
app.use(["/api/v1/payment", "/api/payment"], paymentRoutes);
app.use(["/api/v1/banners", "/api/banners"], bannerRoutes);
app.use(["/api/v1/admin", "/api/admin"], adminRoutes);
app.use(["/api/v1/contact", "/api/contact"], contactRoutes);
app.use(["/api/v1/returns", "/api/returns"], returnRoutes);
app.use(["/api/v1/exchanges", "/api/exchanges"], exchangeRoutes);
app.use(["/api/v1/admin/reports", "/api/admin/reports"], reportRoutes);

// Error handling middleware (AFTER all routes)
app.use(notFound);
app.use(errorHandler);

export default app;
