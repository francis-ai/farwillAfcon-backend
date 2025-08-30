import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile
} from "../../controllers/auth/userAuthController.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getUserProfile);

export default router;
