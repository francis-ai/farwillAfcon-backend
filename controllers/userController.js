// controllers/reservationController.js
import axios from "axios";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";

// @desc    Verify payment user's reservations
// @route   POST /api/user/verify
// @access  Private/User
export const verifyAndSaveReservation = async (req, res) => {
  const { reference, user: userData, plan } = req.body; // frontend sends user & plan objects

  try {
    // 1. Verify with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const paymentData = paystackRes.data.data;

    if (paystackRes.data.status && paymentData.status === "success") {
      // 2. Ensure reservation doesn’t already exist
      const exists = await Reservation.findOne({ paymentRef: reference });
      if (exists) {
        return res
          .status(400)
          .json({ success: false, message: "Reservation already exists" });
      }

      // 3. Fetch user from DB
      const user = await User.findById(userData.id).select("name email");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // 4. Save reservation matching schema
      const reservation = await Reservation.create({
        user: {
          id: user._id,
          email: user.email
        },
        plan: {
          category: plan.category,
          nights: plan.nights,
          people: plan.people,
          total: plan.total,
          price: plan.price // include price if your schema requires it
        },
        paymentRef: reference,
        status: "paid"
      });

      return res.json({
        success: true,
        message: "Payment verified & reservation saved",
        data: reservation
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Payment not verified" });
  } catch (error) {
    console.error("❌ Verify Reservation Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    GET user's reservations
// @route   GET /api/user/reservations
// @access  Private/User
export const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const reservations = await Reservation.find({ 'user.id': userId });

    res.json({
      success: true,
      data: reservations
    });
  } catch (err) {
    console.error('❌ Fetch user reservations failed:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your reservations'
    });
  }
};