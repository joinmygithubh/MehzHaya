import express from "express";
import {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", getBanners);
router.get("/admin/all", protect, authorize("admin"), getAllBanners);
router.post("/", protect, authorize("admin"), upload.single("image"), createBanner);
router
  .route("/:id")
  .put(protect, authorize("admin"), upload.single("image"), updateBanner)
  .delete(protect, authorize("admin"), deleteBanner);

export default router;
