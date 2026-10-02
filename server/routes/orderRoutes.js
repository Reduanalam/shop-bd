import express from "express";
import {
  placeOrder,
  placeDirectOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/", placeOrder);
router.post("/direct", placeDirectOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

export default router;
