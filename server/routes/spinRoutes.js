import express from "express";
import { getSpinStatus, spinWheel } from "../controllers/spinController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.get("/status", protect, getSpinStatus);
router.post("/", protect, spinWheel);

export default router;
