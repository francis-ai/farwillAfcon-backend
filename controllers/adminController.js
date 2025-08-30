import User from "../models/User.js";
import Package from "../models/Package.js";
import Fees from "../models/Fees.js";
import Reservation from "../models/Reservation.js";
import SupportTicket from "../models/SupportTicket.js";
import sendEmail from "../utils/SendEmail.js";  // ✅ correct import
import ExcelJS from "exceljs";

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users excluding passwords
    const users = await User.find().select("-password");
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users"
    });
  }
};

// ================== PACKAGES ================== //

// @desc    Create a new package
// @route   POST /api/admin/packages
// @access  Private/Admin
export const createPackage = async (req, res) => {
  try {
    const { category, durations } = req.body;

    const newPackage = await Package.create({ category, durations });
    res.status(201).json({ success: true, data: newPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all packages
// @route   GET /api/admin/packages
// @access  Private/Admin
export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a package by ID
// @route   PUT /api/admin/packages/:id
// @access  Private/Admin
export const updatePackage = async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPackage)
      return res.status(404).json({ success: false, message: "Package not found" });

    res.status(200).json({ success: true, data: updatedPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a package by ID
// @route   DELETE /api/admin/packages/:id
// @access  Private/Admin
export const deletePackage = async (req, res) => {
  try {
    const deletedPackage = await Package.findByIdAndDelete(req.params.id);
    if (!deletedPackage)
      return res.status(404).json({ success: false, message: "Package not found" });

    res.status(200).json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== FEES ================== //

// @desc    Create or update fees (only one fees document)
// @route   POST /api/admin/fees
// @access  Private/Admin
export const setFees = async (req, res) => {
  try {
    const { visaFee, airportPickupFee, miscFee, ticketPrice, marginPercentage } = req.body;

    let fees = await Fees.findOne();
    if (fees) {
      // update existing
      fees.visaFee = visaFee;
      fees.airportPickupFee = airportPickupFee;
      fees.miscFee = miscFee;
      fees.ticketPrice = ticketPrice;
      fees.marginPercentage = marginPercentage ?? fees.marginPercentage;
      await fees.save();
    } else {
      // create new
      fees = await Fees.create({ visaFee, airportPickupFee, miscFee, ticketPrice, marginPercentage });
    }

    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current fees
// @route   GET /api/admin/fees
// @access  Private/Admin
export const getFees = async (req, res) => {
  try {
    const fees = await Fees.findOne();
    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete fees (if ever needed)
// @route   DELETE /api/admin/fees
// @access  Private/Admin
export const deleteFees = async (req, res) => {
  try {
    const fees = await Fees.findOneAndDelete();
    if (!fees) return res.status(404).json({ success: false, message: "Fees not found" });

    res.status(200).json({ success: true, message: "Fees deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== RESERVATION ================== //

// @desc    GET All Reservations
// @route   GET /api/admin/reservation
// @access  Private/Admin
export const getAllReservations = async (req, res) => {
  try {
    // Fetch all reservations from database
    const reservations = await Reservation.find().sort({ createdAt: -1 }); // newest first

    // Return raw data as-is
    res.json({
      success: true,
      data: reservations
    });
  } catch (err) {
    console.error("❌ Fetch all reservations failed:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching reservations"
    });
  }
};

// GET /api/admin/reservations/export
export const exportReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "email") // get user info
      .populate("plan"); // get plan info

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reservations");

    // Define headers
    worksheet.columns = [
      { header: "S/N", key: "index", width: 10 }, // NEW index column
      { header: "Email", key: "email", width: 30 },
      { header: "Plan", key: "plan", width: 20 },
      { header: "Nights", key: "nights", width: 10 },
      { header: "People per room", key: "people", width: 20 },
      { header: "Price", key: "price", width: 15 },
      { header: "Total (with other fees included)", key: "total", width: 25 },
      { header: "Status", key: "status", width: 15 },
      { header: "Created At", key: "createdAt", width: 20 },
      { header: "Action", key: "action", width: 15 }, // NEW empty column
    ];

    // Add data rows with index
    reservations.forEach((r, i) => {
      worksheet.addRow({
        index: i + 1, // Row number
        email: r.user?.email,
        plan: r.plan?.category,
        nights: r.plan?.nights,
        people: r.plan?.people,
        price: r.plan?.price,
        total: r.plan?.total,
        status: r.status,
        createdAt: new Date(r.createdAt).toLocaleString(),
        action: "", // Empty column for ticking manually
      });
    });

    // Send file as download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=reservations.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error exporting reservations" });
  }
};

// ---------------- GET ALL TICKETS (ADMIN) ---------------- // 
export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ tickets });
  } catch (err) {
    console.error("Error fetching support tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- REPLY TO TICKET (Admin) ---------------- //
export const replyToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { replyMessage, status } = req.body;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Update ticket fields
    ticket.attended = true;
    ticket.status = status || "closed";
    ticket.adminReply = replyMessage;
    ticket.repliedAt = new Date();
    await ticket.save();

    // ✨ Email template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0a6319;">Farwill Afcon Support Team</h2>
        
        <p>Hello,</p>
        <p>We have reviewed your support request and here is our response:</p>

        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #f0b939ff; background: #f9f9f9;">
          <p><strong>Your Message:</strong></p>
          <p style="margin: 5px 0; font-style: italic;">"${ticket.message}"</p>
        </div>

        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #0a6319; background: #f1fef4;">
          <p><strong>Our Reply:</strong></p>
          <p style="margin: 5px 0;">${replyMessage}</p>
        </div>

        <p>Status of your ticket: <strong>${ticket.status}</strong></p>

        <p style="margin-top: 20px;">Thank you for reaching out to us. If you need further assistance, simply reply to this email.</p>

        <p style="color: #555; font-size: 12px; margin-top: 30px;">
          — Farwill Afcon Support Team
        </p>
      </div>
    `;

    // ✅ Send styled email
    await sendEmail(
      ticket.email,
      "Support Ticket Reply - Farwill Afcon",
      htmlContent
    );

    res.json({ message: "Reply sent and ticket updated", ticket });
  } catch (err) {
    console.error("Error replying to ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
};
