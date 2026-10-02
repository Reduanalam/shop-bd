import express from "express";
import { getCategories, getBrands } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/brands/all", getBrands);

export default router;
