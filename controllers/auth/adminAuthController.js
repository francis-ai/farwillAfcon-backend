import Admin from "../../models/Admin.js";
import User from "../../models/User.js";
import generateToken from "../../utils/generateToken.js";

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Admin Profile
// @route   GET /api/auth/user/profile
// @access  Private
export const getAdminProfile = async (req, res) => {
  try {
    const user = await Admin.findById(req.user.id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};