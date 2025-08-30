import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin",
    },
  },
  { timestamps: true }
);

// Encrypt password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 👇 force collection name
const Admin = mongoose.model("Admin", adminSchema, "tbl_admins");

export default Admin;
