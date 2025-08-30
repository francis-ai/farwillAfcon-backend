import express from "express";
import { adminLogin, getAdminProfile} from "../../controllers/auth/adminAuthController.js";
import { protect, adminOnly } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.post("/login", adminLogin);
router.get("/profile", protect, adminOnly, getAdminProfile);


export default router;
