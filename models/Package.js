import mongoose from "mongoose";

const roomOptionSchema = new mongoose.Schema({
  people: { type: Number },  // 1, 2, 3, 4...
  price: { type: Number, required: true }   // price for this room option
});

const durationSchema = new mongoose.Schema({
  nights: { type: Number, required: true },      // 6 or 9
  roomOptions: [roomOptionSchema]               // prices per number of people
});

const packageSchema = new mongoose.Schema({
  category: { 
    type: String, 
    enum: ["3 star", "4 star", "5 star"],  // fixed typo "4 start" → "4 star"
    required: true 
  },
  durations: [durationSchema]                   // 6-night & 9-night options
}, { timestamps: true });

// Force collection name to tbl_packages
const Package = mongoose.model("Package", packageSchema, "tbl_packages");

export default Package;
