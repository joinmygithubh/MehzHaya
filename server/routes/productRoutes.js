import express from "express";
import {
  getProducts,
  getSuggestions,
  getHomeSections,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getAdminProducts,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/suggestions", getSuggestions);
router.get("/sections/home", getHomeSections);
router.get("/admin/all", protect, authorize("admin"), getAdminProducts);

router.post("/", protect, authorize("admin"), upload.array("images", 6), createProduct);
router
  .route("/:id")
  .put(protect, authorize("admin"), upload.array("images", 6), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);
router.delete("/:id/images/:publicId", protect, authorize("admin"), deleteProductImage);

// keep last: matches id or slug
router.get("/:idOrSlug", getProduct);

export default router;
