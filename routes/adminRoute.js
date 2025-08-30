import express from "express";
import {
  getAllUsers,
  createPackage,
  getAllPackages,
  updatePackage,
  deletePackage,
  setFees,
  getFees,
  deleteFees,
  getAllReservations,
  exportReservations,
  getSupportTickets,
  replyToTicket
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ================== USERS ================== //
router.get("/users", protect, adminOnly, getAllUsers);

// ================== PACKAGES ================== //
router.post("/packages", protect, adminOnly, createPackage);
router.get("/packages", protect, adminOnly, getAllPackages);
router.put("/packages/:id", protect, adminOnly, updatePackage);
router.delete("/packages/:id", protect, adminOnly, deletePackage);

// ================== FEES ================== //
router.post("/fees", protect, adminOnly, setFees);
router.get("/fees", protect, adminOnly, getFees);
router.delete("/fees", protect, adminOnly, deleteFees);

// ================== RESERVATION ================== //
router.get("/reservation", protect, adminOnly, getAllReservations);
router.get("/reservations/export", exportReservations);

// ================== SUPPORT TICKET ================== //
router.get("/support", protect, adminOnly, getSupportTickets);
router.post("/support/:ticketId/reply", protect, adminOnly, replyToTicket);

export default router;
