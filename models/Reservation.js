import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  user: {
    id: { type: String, required: true },     // frontend user id
    email: { type: String, required: true },
  },
  plan: {
    category: { type: String, required: true },
    nights: { type: Number, required: true },
    people: { type: Number, required: true },
    price: { type: Number, required: true },  // per person/room price
    total: { type: Number, required: true }
  },
  paymentRef: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("Reservation", reservationSchema, "tbl_reservations");
