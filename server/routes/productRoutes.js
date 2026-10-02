import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Public Routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin Routes (Product Create, Update & Delete)
router.post("/admin/products", createProduct);
router.put("/admin/products/:id", updateProduct);
router.delete("/admin/products/:id", deleteProduct);

export default router;