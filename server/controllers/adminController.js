import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc    Dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalProducts,
    totalUsers,
    totalOrders,
    lowStock,
    revenueAgg,
    statusAgg,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ role: "user" }),
    Order.countDocuments(),
    Product.countDocuments({ stock: { $lt: 5 } }),
    Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    Order.find().sort("-createdAt").limit(8).populate("user", "name email"),
    Product.find().sort("-sold").limit(5).select("name sold price images ratings"),
  ]);

  // monthly sales (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  const monthlySales = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalProducts,
      totalUsers,
      totalOrders,
      lowStock,
      totalRevenue: revenueAgg[0]?.total || 0,
      ordersByStatus: statusAgg,
      monthlySales,
      recentOrders,
      topProducts,
    },
  });
});
