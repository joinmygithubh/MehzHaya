import express from "express";
import rateLimit from "express-rate-limit";
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} from "../controllers/contactController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Strict Rate limiting on public contact form submission (5 submissions per 15 mins per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many contact form submissions from this IP, please try again after 15 minutes.",
  },
});

// Public customer submission route
router.post("/", contactLimiter, createContactMessage);

// Admin-only management routes (Guarded by RBAC)
router.get("/admin", protect, authorize("admin"), getAllContactMessages);
router.get("/admin/:id", protect, authorize("admin"), getContactMessageById);
router.patch("/admin/:id", protect, authorize("admin"), updateContactMessageStatus);
router.delete("/admin/:id", protect, authorize("admin"), deleteContactMessage);

export default router;
