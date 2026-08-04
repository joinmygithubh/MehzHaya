import express from "express";
import {
  updateProfile,
  updateAvatar,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getRecentlyViewed,
  addRecentlyViewed,
  syncRecentlyViewed,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.use(protect);

router.put("/profile", updateProfile);
router.put("/avatar", upload.single("avatar"), updateAvatar);

router.get("/recently-viewed", getRecentlyViewed);
router.post("/recently-viewed", addRecentlyViewed);
router.post("/recently-viewed/sync", syncRecentlyViewed);

router
  .route("/addresses")
  .get(getAddresses)
  .post(addAddress);
router
  .route("/addresses/:id")
  .put(updateAddress)
  .delete(deleteAddress);

// Admin
router.get("/", authorize("admin"), getAllUsers);
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id/role", authorize("admin"), updateUserRole);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
