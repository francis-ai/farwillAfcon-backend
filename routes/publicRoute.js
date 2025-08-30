import express from "express";
import { getFees, getPackages, createSupportTicket } from "../controllers/publicController.js";

const router = express.Router();

// @route   GET /api/packages
// @desc    Fetch all packages for users
// @access  Public
router.get("/packages", getPackages);

// @route   GET /api/fees
// @desc    Fetch all fees for users
// @access  Public
router.get("/fees", getFees);


// Public - users can create ticket
router.post("/support", createSupportTicket);

// // Admin - view all tickets
// router.get("/support", protectAdmin, getSupportTickets);

// // Admin - reply to ticket
// router.post("/support/:ticketId/reply", replyToTicket);

export default router;
