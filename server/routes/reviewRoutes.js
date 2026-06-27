import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getAllReviews);
router.get("/:productId", getProductReviews);
router.post("/:productId", protect, createReview);
router.delete("/:productId", protect, deleteReview);

export default router;
