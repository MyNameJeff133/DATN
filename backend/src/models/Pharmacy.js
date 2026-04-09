// models/Pharmacy.js
import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
  name: String,
  address: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Pharmacy", pharmacySchema);
