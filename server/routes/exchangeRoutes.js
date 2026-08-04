import express from "express";
import {
  createExchangeRequest,
  getMyExchanges,
  getExchangeById,
  cancelExchangeRequest,
  getAllExchangesAdmin,
  updateExchangeStatusAdmin,
} from "../controllers/exchangeController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createExchangeRequest);
router.get("/my-exchanges", getMyExchanges);
router.get("/:id", getExchangeById);
router.put("/:id/cancel", cancelExchangeRequest);
router.patch("/:id/cancel", cancelExchangeRequest);

// Admin routes
router.get("/admin/all", authorize("admin"), getAllExchangesAdmin);
router.put("/admin/:id", authorize("admin"), updateExchangeStatusAdmin);

export default router;
