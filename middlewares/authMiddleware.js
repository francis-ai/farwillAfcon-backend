import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

// Protect route for logged-in users (User or Admin)
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's an Admin first, otherwise a User
      req.user = (await Admin.findById(decoded.id)) || (await User.findById(decoded.id));

      if (!req.user) return res.status(401).json({ message: "Not authorized, token failed" });

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) res.status(401).json({ message: "No token, authorization denied" });
};

// Restrict to Admin only
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role) {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};
