import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";

import authRoutes from "./routes/adminRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";

import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import cartRoutes from "./routes/cartRoutes.js";

import employeeRoutes from "./routes/employeeRoutes.js"

import { protect } from "./middlewares/authMiddleware.js";
import cors from "cors";
import { ensureAdminExists } from "./controller/adminController.js";
import path from "path"; // <-- make sure this line exists


dotenv.config();
connectDB();
const app = express();
app.use(cors());

app.use(express.json());


ensureAdminExists()


app.get("/", (req, res) => {
  res.send("Backend Server is working");
});
app.use("/uploads", express.static(path.join("uploads")));



app.use("/api/admin", authRoutes);

app.use("/api/vendor", vendorRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/user", userRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/employee", employeeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
