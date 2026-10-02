import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  createBrand, 
  updateBrand, 
  deleteBrand 
} from "../controllers/categoryController.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../controllers/couponController.js";
import { getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { getAdminSettings, updateSettings } from "../controllers/settingController.js";
import { getAllBanners, createBanner, updateBanner, deleteBanner } from "../controllers/bannerController.js";
import { uploadImage, uploadMultipleImages } from "../controllers/uploadController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.post("/upload", upload.single("image"), uploadImage);
router.post("/upload-multiple", upload.array("images", 6), uploadMultipleImages);

// Product Routes
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Category Routes
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Brand Routes
router.post("/brands", createBrand);
router.put("/brands/:id", updateBrand);
router.delete("/brands/:id", deleteBrand);

// Order Routes
router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderStatus);

// Coupon Routes
router.get("/coupons", getCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

// Setting Routes
router.get("/settings", getAdminSettings);
router.put("/settings", updateSettings);

// Banner/Slider Routes
router.get("/banners", getAllBanners);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);

// User Routes
router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;