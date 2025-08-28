import express from "express";
import {
  createPaymentOrder,
  createOrder,
  verifyPayment,
  getUserOrders,
  getAllOrders,
} from "../controller/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { access } from "../middlewares/accessMiddleware.js";

const router = express.Router();

router.post("/payment/order", protect, createPaymentOrder); // Step 1: Razorpay order
router.post("/create", protect, createOrder); // Step 2: Final order (COD or after payment)
router.post("/verify", protect, verifyPayment); // Step 3: Verify Razorpay & create order

router.get("/my-orders", protect, getUserOrders);
router.get("/getAllOrders", getAllOrders);

export default router;
