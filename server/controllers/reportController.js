import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Return from "../models/Return.js";
import Category from "../models/Category.js";

// Helper: build date query match
const getPeriodDateQuery = (period, startDate, endDate) => {
  const now = new Date();
  let start = new Date();

  if (startDate && endDate) {
    return { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  if (period === "daily") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    start.setDate(now.getDate() - 7);
  } else if (period === "monthly") {
    start.setMonth(now.getMonth() - 1);
  } else if (period === "yearly") {
    start.setFullYear(now.getFullYear() - 1);
  } else {
    // Default last 30 days
    start.setDate(now.getDate() - 30);
  }

  return { $gte: start, $lte: now };
};

// @desc    Get Sales & Analytics Report
// @route   GET /api/v1/admin/reports/sales
// @access  Admin
export const getSalesReport = asyncHandler(async (req, res) => {
  const { period, startDate, endDate, category, orderStatus, paymentStatus } = req.query;

  const matchQuery = {};

  // Date Filter
  matchQuery.createdAt = getPeriodDateQuery(period, startDate, endDate);

  // Status Filters
  if (orderStatus && orderStatus !== "ALL") {
    matchQuery.orderStatus = orderStatus;
  } else {
    matchQuery.orderStatus = { $ne: "Cancelled" };
  }

  if (paymentStatus && paymentStatus !== "ALL") {
    matchQuery["paymentInfo.status"] = paymentStatus;
  }

  // 1. Overall Revenue & Orders
  const salesAgg = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 },
        totalShipping: { $sum: "$shippingPrice" },
        totalDiscounts: { $sum: "$discountPrice" },
        avgOrderValue: { $avg: "$totalPrice" },
      },
    },
  ]);

  const summary = salesAgg[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    totalShipping: 0,
    totalDiscounts: 0,
    avgOrderValue: 0,
  };

  // 2. Sales Trend (Grouped by Date)
  const salesTrend = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 3. Payment Method Breakdown
  const paymentBreakdown = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        total: { $sum: "$totalPrice" },
      },
    },
  ]);

  // 4. Order Status Breakdown
  const statusBreakdown = await Order.aggregate([
    {
      $match: {
        createdAt: matchQuery.createdAt,
      },
    },
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  // 5. Returns Summary
  const returnAgg = await Return.aggregate([
    {
      $match: {
        createdAt: matchQuery.createdAt,
      },
    },
    {
      $group: {
        _id: null,
        totalReturns: { $sum: 1 },
        totalRefunded: { $sum: "$refundAmount" },
      },
    },
  ]);

  const returnStats = returnAgg[0] || { totalReturns: 0, totalRefunded: 0 };

  // 6. Inventory Valuation & Low Stock
  const [inventoryStats, topProducts] = await Promise.all([
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalInventoryValue: { $sum: { $multiply: ["$price", "$stock"] } },
          totalProductsCount: { $sum: 1 },
          lowStockCount: {
            $sum: { $cond: [{ $lte: ["$stock", 5] }, 1, 0] },
          },
        },
      },
    ]),
    Product.find().sort("-sold").limit(5).select("name categoryName price sold stock images"),
  ]);

  res.status(200).json({
    success: true,
    summary,
    salesTrend,
    paymentBreakdown,
    statusBreakdown,
    returnStats,
    inventory: inventoryStats[0] || { totalInventoryValue: 0, totalProductsCount: 0, lowStockCount: 0 },
    topProducts,
  });
});

// @desc    Export Sales Report to CSV
// @route   GET /api/v1/admin/reports/export
// @access  Admin
export const exportSalesReportCSV = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const matchQuery = {
    createdAt: getPeriodDateQuery(period, startDate, endDate),
  };

  const orders = await Order.find(matchQuery)
    .populate("user", "name email")
    .sort("-createdAt");

  let csv = "Order ID,Customer,Email,Status,Payment Method,Payment Status,Items Count,Total Price,Created At\n";

  orders.forEach((o) => {
    const orderId = o.orderId || o._id;
    const name = `"${o.user?.name || "Guest"}"`;
    const email = o.user?.email || "N/A";
    const status = o.orderStatus;
    const payMethod = o.paymentMethod;
    const payStatus = o.paymentInfo?.status || "Pending";
    const itemsCount = o.items?.reduce((s, i) => s + i.quantity, 0) || 0;
    const price = o.totalPrice;
    const date = new Date(o.createdAt).toISOString();

    csv += `${orderId},${name},${email},${status},${payMethod},${payStatus},${itemsCount},${price},${date}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=mehzhaya_sales_report_${Date.now()}.csv`);
  res.status(200).send(csv);
});
