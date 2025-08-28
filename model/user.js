import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    mobile: { type: String, required: true },
    alternativeMobile: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Address details
    hno: { type: String },       // House / Door Number
    street: { type: String },
    area: { type: String },
    address: { type: String },   // Full Address or Landmark
    state: { type: String },
    pincode: { type: String },

    // For password reset
    forgotOtp: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
