import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const admin = await Admin.create({
      email: "admin@gmail.com",
      password: "12345678", // plain, schema pre-save hook will hash it
      role: "superadmin",
    });

    console.log("✅ Admin created:", admin);
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
