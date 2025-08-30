// import mongoose from "mongoose";
// import Counter from "./Counter.js";

// const OrderSchema = new mongoose.Schema({
//   orderId: { type: String, unique: true }, // <-- custom sequential ID
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
//   paymentMethod: { type: String, enum: ["COD", "RAZORPAY"], required: true },
//   paymentId: { type: String }, // Razorpay paymentId (if online)
//   orderStatus: {
//     type: String,
//     enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
//     default: "PENDING",
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// // Pre-save hook to auto-generate orderId
// OrderSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     const counter = await Counter.findOneAndUpdate(
//       { name: "order" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );

//     this.orderId = `ORD-${counter.seq.toString().padStart(3, "0")}`;
//   }
//   next();
// });

// const Order = mongoose.model("Order", OrderSchema);
// export default Order;

import mongoose from "mongoose";
import Counter from "./Counter.js";

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true }, // custom sequential ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },

  paymentMethod: { type: String, enum: ["COD", "RAZORPAY"], required: true },
  paymentId: { type: String }, // Razorpay paymentId (if online)

  orderStatus: {
    type: String,
    enum: [
      "PENDING", // order created, waiting for payment/confirmation
      "PAID", // paid but not yet assigned
      "ASSIGNED", // assigned to employee
      "PICKED_UP", // pickup done by employee
      "DELIVERED", // delivery done
      "FAILED",
      "CANCELLED",
    ],
    default: "PENDING",
  },

  // ---------- New Fields for Employee Assignment ----------
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  processStatus: {
    type: String,
    enum: ["PLACED", "ASSIGNED", "PICKED", "DELIVERED"],
    default: "PLACED",
  },

  // Tracking important dates
  placedAt: { type: Date, default: Date.now },
  assignedAt: { type: Date },
  pickedAt: { type: Date },
  deliveredAt: { type: Date },

  // Employee uploads
  pickupImage: { type: String },
  deliveryImage: { type: String },

  // Live tracking location
  location: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date },
  },

  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to auto-generate sequential orderId
OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.orderId = `ORD-${counter.seq.toString().padStart(3, "0")}`;
  }
  next();
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
