import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc Get admin dashboard stats
// @route GET /api/admin/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, totalProducts, totalUsers, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name");

    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue: revenueAgg[0]?.total || 0,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};
