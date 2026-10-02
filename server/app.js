import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import spinRoutes from "./routes/spinRoutes.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  // Production frontend
  "https://shop-bd-xi.vercel.app",

  // Render environment variable
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // Example: Postman, curl, mobile apps
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  })
);

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* =========================
   RATE LIMIT
========================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

app.use("/api", limiter);

/* =========================
   ROOT ROUTE
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running",
  });
});

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/spin", spinRoutes);

/* =========================
   ERROR HANDLING
========================= */

app.use(notFound);
app.use(errorHandler);

export default app;