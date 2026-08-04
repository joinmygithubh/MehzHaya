import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  restoreAbandonedCart,
  getAdminAbandonedCarts,
} from "../controllers/cartController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public restoration route
router.get("/restore/:token", restoreAbandonedCart);

// Protected routes
router.use(protect);
router.get("/admin/abandoned", authorize("admin"), getAdminAbandonedCarts);

router.route("/").get(getCart).post(addToCart).delete(clearCart);
router.route("/coupon").post(applyCoupon).delete(removeCoupon);
router.route("/:itemId").put(updateCartItem).delete(removeCartItem);

export default router;
