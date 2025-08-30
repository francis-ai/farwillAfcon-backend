import express from "express";
import { 
    verifyAndSaveReservation,
    getUserReservations
 } from "../controllers/userController.js";
 import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @desc    Verify payment user's reservations
// @route   POST /api/user/verify
// @access  Private/User
router.post("/verify", verifyAndSaveReservation);

// @desc    GET user's reservations
// @route   GET /api/user/reservations
// @access  Private/User
router.get('/reservations', protect, getUserReservations);

export default router;
