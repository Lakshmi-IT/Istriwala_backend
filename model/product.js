import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  Category: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  price: { type: Number, required: true },
  address: { type: String, required: true },
  features: { type: [String] },
  image: { type: [String] },
  videos: { type: [String] },
  isActive: { type: Boolean, default: false },
  vandorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
