import express from "express";
import { getSalesReport, exportSalesReportCSV } from "../controllers/reportController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/sales", getSalesReport);
router.get("/export", exportSalesReportCSV);

export default router;
