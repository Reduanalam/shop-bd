import express from "express";

import {
  placeOrder,
  placeDirectOrder,
  quoteOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/orderController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Price / Coupon preview
router.post("/quote", quoteOrder);

// Place order from cart
router.post("/", placeOrder);

// Buy Now
router.post("/direct", placeDirectOrder);

// User orders
router.get("/", getMyOrders);

// Single order
router.get("/:id", getOrderById);

// Cancel order
router.put("/:id/cancel", cancelOrder);

export default router;