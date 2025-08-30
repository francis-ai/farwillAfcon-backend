import Fees from "../models/Fees.js";
import Package from "../models/Package.js";
import SupportTicket from "../models/SupportTicket.js";
import nodemailer from "nodemailer";

// Setup Nodemailer (use your SMTP or Gmail credentials)
const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your app password
  },
});

// Get all fees
export const getFees = async (req, res) => {
  try {
    const fees = await Fees.findOne();
    res.status(200).json({ success: true, data: fees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all packages
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json({ success: true, data: packages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- CREATE TICKET ---------------- // 
export const createSupportTicket = async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false, message: "Email and message are required" });
    }

    const ticket = new SupportTicket({ email, message });
    await ticket.save();

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (err) {
    console.error("Error creating support ticket:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
