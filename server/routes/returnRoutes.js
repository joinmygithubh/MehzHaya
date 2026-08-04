import express from "express";
import {
  createReturnRequest,
  getMyReturns,
  getReturnById,
  getAllReturnsAdmin,
  updateReturnStatusAdmin,
  cancelReturnRequest,
} from "../controllers/returnController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.array("images", 5), createReturnRequest);
router.get("/my-returns", getMyReturns);
router.get("/:id", getReturnById);
router.put("/:id/cancel", cancelReturnRequest);
router.patch("/:id/cancel", cancelReturnRequest);

// Admin routes
router.get("/admin/all", authorize("admin"), getAllReturnsAdmin);
router.put("/admin/:id", authorize("admin"), updateReturnStatusAdmin);

export default router;
