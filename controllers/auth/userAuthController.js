import User from "../../models/User.js";
import generateToken from "../../utils/generateToken.js";
import sendEmail from "../../utils/SendEmail.js";
import crypto from "crypto";

// @desc    Register new user
// @route   POST /api/auth/user/register
// @access  Public
export const registerUser = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ fullname, email, password });

    const resetUrl = process.env.CLIENT_URL

    // Send welcome email
    const message = `
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
                <td style="padding: 30px 20px; text-align: center; background-color: #0a6319; color: white;">
                    <h1 style="margin: 0; color: #fff;">Farwill Afcon</h1>
                </td>
            </tr>

            <!-- Welcome Message -->
            <tr>
                <td style="padding: 40px 30px 20px 30px; text-align: center; font-size: 16px; line-height: 1.6; color: #333;">
                    <h2 style="color: #0a6319; margin-top: 0;">Welcome, ${fullname}! 👋</h2>
                    <p>A huge welcome to the Farwill Afcon community! Your account has been successfully created and you're all set to start your journey.</p>
                    <p>We're thrilled to have you on board. Get ready for an exciting experience with the best AFCON insights and updates.</p>
                </td>
            </tr>

            <!-- CTA Button -->
            <tr>
                <td style="padding: 10px 30px 30px 30px; text-align: center;">
                    <a href="${resetUrl}/dashboard" target="_blank" style="background-color:#0a6319; color: #FFF; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Go to Your Dashboard</a>
                </td>
            </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">
            <tr>
                <td style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p style="margin: 0;">&copy; 2025 Farwill Afcon. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>`;


    await sendEmail(user.email, "Welcome to Farwill Afcon", message);

    res.status(201).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/user/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get User Profile
// @route   GET /api/auth/user/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/user/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
                <td style="padding: 30px 20px; text-align: center; background-color: #0a6319; color: white;">
                    <h1 style="margin: 0; color: #fff;">Farwill Afcon</h1>
                </td>
            </tr>

            <!-- Password Reset Message -->
            <tr>
                <td style="padding: 40px 30px 20px 30px; text-align: center; font-size: 16px; line-height: 1.6; color: #333;">
                    <h2 style="color: #0a6319; margin-top: 0;">Password Reset Request</h2>
                    <p>You requested a password reset for your Farwill Afcon account.</p>
                    <p>Click the button below to reset your password. This link is valid for the next <strong>10 minutes</strong> for your security.</p>
                </td>
            </tr>

            <!-- CTA Button -->
            <tr>
                <td style="padding: 10px 30px 30px 30px; text-align: center;">
                    <a href="${resetUrl}" target="_blank" style="background-color: #0a6319; color: #FFF; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Reset Your Password</a>
                </td>
            </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">
            <tr>
                <td style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p style="margin: 0;">&copy; 2025 Farwill Afcon. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>`;

    await sendEmail(user.email, "Farwill Afcon Password Reset", message);

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending reset email" });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/user/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const resetToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful, you can now login" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
