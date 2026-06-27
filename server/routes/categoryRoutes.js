import express from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, authorize("admin"), upload.single("image"), createCategory);
router.get("/:slug", getCategory);
router
  .route("/:id")
  .put(protect, authorize("admin"), upload.single("image"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

export default router;
