
// import mongoose from "mongoose";

// const OrderSchema = new mongoose.Schema({
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

// const Order = mongoose.model("Order", OrderSchema);
// export default Order;


// models/Order.js
import mongoose from "mongoose";
import Counter from "./Counter.js";

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true }, // <-- custom sequential ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
  paymentMethod: { type: String, enum: ["COD", "RAZORPAY"], required: true },
  paymentId: { type: String }, // Razorpay paymentId (if online)
  orderStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to auto-generate orderId
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
