import express from "express";
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/key", getRazorpayKey);
router.post("/order", createRazorpayOrder);
router.post("/verify", verifyPayment);

export default router;
