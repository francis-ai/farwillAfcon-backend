import mongoose from "mongoose";

const feesSchema = new mongoose.Schema({
  visaFee: { type: Number, required: true },
  airportPickupFee: { type: Number, required: true },
  miscFee: { type: Number, required: true },
  ticketPrice: { type: Number, required: true },
  marginPercentage: { type: Number, default: 20 } // 20% by default
}, { timestamps: true });

const Fees = mongoose.model("Fees", feesSchema, "tbl_fees");
export default Fees;
