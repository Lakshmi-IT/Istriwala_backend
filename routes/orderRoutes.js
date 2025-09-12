// import express from "express";
// import {
//   createPaymentOrder,
//   createOrder,
//   verifyPayment,
//   getUserOrders,
//   getAllOrders,
// } from "../controller/orderController.js";
// import { protect } from "../middlewares/authMiddleware.js";
// import { access } from "../middlewares/accessMiddleware.js";

// const router = express.Router();

// router.post("/payment/order", protect, createPaymentOrder); // Step 1: Razorpay order
// router.post("/create", protect, createOrder); // Step 2: Final order (COD or after payment)
// router.post("/verify", protect, verifyPayment); // Step 3: Verify Razorpay & create order

// router.get("/my-orders", protect, getUserOrders);
// router.get("/getAllOrders", getAllOrders);

// export default router;

import express from "express";
import {
  createPaymentOrder,
  createOrder,
  verifyPayment,
  getUserOrders,
  getAllOrders,

  // 🔹 Employee/Admin controllers
  assignOrderToEmployee,
  updatePickup,
  updateDelivery,
  // updateLocation,
  getEmployeeOrders,
  verifyCode,
  cancelOrder,
} from "../controller/orderController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { access } from "../middlewares/accessMiddleware.js"; // for role-based (admin/employee)
import upload from "../middlewares/upload.js"; // for images (Multer / S3)

const router = express.Router();

/* ---------------- USER ROUTES ---------------- */
router.post("/payment/order", protect, createPaymentOrder); // Step 1: Razorpay order
router.post("/create/:mobile", createOrder); // Step 2: Final order (COD or after payment)
router.post("/verify", protect, verifyPayment); // Step 3: Verify Razorpay & create order

router.get("/my-orders/:mobile", getUserOrders);
router.get("/getAllOrders", getAllOrders);

router.put("/employee/verifyCode",verifyCode)

/* ---------------- ADMIN ROUTES ---------------- */
// Admin assigns an order to employee
router.put("/assign", protect, access("ADMIN"), assignOrderToEmployee);

/* ---------------- EMPLOYEE ROUTES ---------------- */
// Employee fetches assigned orders
router.get("/employee/orders", protect, access("EMPLOYEE"), getEmployeeOrders);

// Employee updates pickup (with image)
router.put(
  "/employee/pickup",
  protect,
  access("EMPLOYEE"),
  upload.single("pickupImage"), // <-- Must be "pickupImage"
  updatePickup
);

// Employee updates delivery (with image)
router.put(
  "/employee/delivery",
  protect,
  access("EMPLOYEE"),
  upload.single("deliveryImage"),
  updateDelivery
);

router.patch("/cancel/:orderId", cancelOrder);

// Employee updates live location
// router.put("/employee/location", protect, access("EMPLOYEE"), updateLocation);

export default router;
