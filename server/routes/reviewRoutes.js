import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
  getMyReviews,
  updateReviewStatus,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public routes
router.get("/:productId", getProductReviews);

// Protected Customer routes
router.use(protect);
router.get("/my", getMyReviews);
router.post("/:productId", upload.array("images", 3), createReview);
router.delete("/:id", deleteReview);

// Protected Admin routes
router.get("/admin/all", authorize("admin"), getAllReviews);
router.patch("/admin/:id/status", authorize("admin"), updateReviewStatus);

export default router;
