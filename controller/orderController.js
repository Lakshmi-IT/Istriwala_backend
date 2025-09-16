import Order from "../model/orders.js";
import Cart from "../model/cart.js";
import User from "../model/user.js";
import Employee from "../model/Employee.js"; // new employee model
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process?.env?.RAZORPAY_KEY_ID,
  key_secret: process?.env?.RAZORPAY_KEY_SECRET,
});

// ---------------------- PAYMENT FLOW ----------------------

// Razorpay Payment Intent
export const createPaymentOrder = async (req, res) => {
  try {
    const { cartId } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const options = {
      amount: cart.totalPrice * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const razorpayOrder = await razorpay?.orders.create(options);
    res.json({ success: true, razorpayOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};

// Cash on Delivery Order
export const createOrder = async (req, res) => {
  try {
    const { cartId, addressId, paymentMethod } = req.body;
    // const userId = req.user.userId;

    const { mobile } = req.params;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (paymentMethod === "COD") {
      await Cart.findByIdAndUpdate(cartId, { $set: { isActive: true } });

      const order = await Order.create({
        userId: user._id,
        cartId,
        addressId,
        paymentMethod: "COD",
        paymentId: null,
        orderStatus: "PENDING",
        placedAt: new Date(),
      });

      return res.json({ success: true, order });
    }

    res.status(400).json({ error: "Use /orders/payment/order for Razorpay" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Razorpay Verification
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      cartId,
      addressId,
    } = req.body;
    const userId = req.user.userId;

    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env?.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpaySignature !== expectedSign) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid signature" });
    }

    const existingOrder = await Order.findOne({ paymentId: razorpayPaymentId });
    if (existingOrder) {
      return res.json({
        success: true,
        order: existingOrder,
        message: "Order already exists",
      });
    }

    await Cart.findByIdAndUpdate(cartId, { $set: { isActive: true } });

    const order = await Order.create({
      userId,
      cartId,
      addressId,
      paymentMethod: "RAZORPAY",
      paymentId: razorpayPaymentId,
      orderStatus: "PAID",
      placedAt: new Date(),
    });

    return res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Payment Verification Error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

// ---------------------- ADMIN ASSIGNMENT ----------------------

// Assign Order to Employee
export const assignOrderToEmployee = async (req, res) => {
  try {
    const { orderId, employeeId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // update order
    order.assignedEmployee = employeeId;
    employee.assignedOrder = orderId;
    order.orderStatus = "ASSIGNED";
    order.assignedAt = new Date();
    await order.save();

    await employee.save();

    res.json({
      success: true,
      message: "Order assigned successfully",
      order,
      employee,
    });
  } catch (err) {
    console.error("❌ Assign Order Error:", err);
    res.status(500).json({ error: "Failed to assign order" });
  }
};

// ---------------------- EMPLOYEE ACTIONS ----------------------

export const getEmployeeOrders = async (req, res) => {
  try {
    const employeeId = req.user.userId; // employee logged in
    console.log(employeeId, "employeeId");
    const orders = await Order.find({ assignedEmployee: employeeId })
      .populate(
        "userId",
        "userName email mobile area hno street state pincode lat lng"
      )
      .populate("cartId")
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      id: order.orderId,
      assignedAt: order.assignedAt,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      orderStatus: order.orderStatus,
      customer: order.userId?.userName || "N/A",
      phone: order.userId?.mobile || "N/A",
      // service: order.cartId?.items.map((i) => i.item).join(", ") || "N/A",
      service:
        order.cartId?.items.map((i) => `${i.item} x ${i.qty}`).join(", ") ||
        "NA",

      qty: order.cartId?.items.map((i) => i.qty) || 0,
      items: order.cartId?.items?.length || 0,
      amount: `₹${order.cartId?.totalPrice || 0}`,
      status: order.orderStatus || "pending",
      pickupImage: order.pickupImage,
      deliveryImage: order.deliveryImage,
      pickedAt: order.pickedAt,
      pickupId: order.pickupId,
      deliveryId: order.deliveryId,
      deliveredAt: order.deliveredAt,
      lat: order?.userId?.lat || 0,
      lng: order?.userId?.lng || 0,
      date: order.createdAt.toISOString().split("T")[0],
      address: `${order.userId?.hno || ""}, ${order.userId?.street || ""}, ${
        order.userId?.area || ""
      }, ${order.userId?.state || ""}, ${order.userId?.pincode || ""}`,
      employee: {
        _id: employeeId,
      },
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (err) {
    console.error("❌ Fetch Employee Orders Error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Update pickup (image + status)
// export const updatePickup = async (req, res) => {
//   try {
//     console.log(req.file, "req.file"); // Should not be undefined

//     const { orderId } = req.body;
//     const pickupImage = req.file?.location; // Multer sets req.file

//     if (!pickupImage) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ error: "Order not found" });

//     order.pickupImage = pickupImage;
//     order.orderStatus = "PICKED_UP";
//     order.pickedAt = new Date();
//     await order.save();

//     res.json({ success: true, order });
//   } catch (err) {
//     console.error("❌ Pickup Update Error:", err);
//     res.status(500).json({ error: "Failed to update pickup" });
//   }
// };

function getFileUrl(filePath) {
  const filename = filePath.split("\\").pop(); // Extract filename
  return `/uploads${filename}`; // Relative URL for frontend
}

export const updatePickup = async (req, res) => {
  try {
    console.log(req.file, "req.file"); // Should have path now

    const { orderId } = req.body;
    const pickupImagePath = req.file?.path; // local path

    if (!pickupImagePath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Convert local path to frontend URL
    const pickupImageUrl = getFileUrl(pickupImagePath);

    order.pickupImage = pickupImageUrl; // store URL instead of local path
    order.orderStatus = "PICKED_UP";
    order.pickedAt = new Date();
    await order.save();

    // Return order with frontend-ready URL
    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Pickup Update Error:", err);
    res.status(500).json({ error: "Failed to update pickup" });
  }
};

// Update delivery (image + status)
export const updateDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    const deliveryImage = req.file?.path;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const deliveryImages = getFileUrl(deliveryImage);

    order.deliveryImage = deliveryImages;
    order.orderStatus = "DELIVERED";
    order.deliveredAt = new Date();
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Delivery Update Error:", err);
    res.status(500).json({ error: "Failed to update delivery" });
  }
};

// ---------------------- CUSTOMER VIEWS ----------------------

// Get orders for logged in user
export const getUserOrders = async (req, res) => {
  try {
    const { mobile } = req.params;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user?._id;

    const orders = await Order.find({ userId })
      .populate("cartId")
      .populate("assignedEmployee", "name email mobile")
      .sort({ _id: -1 });

    const totalAmount = orders
      .filter((order) => order.orderStatus !== "CANCELLED") // exclude cancelled
      .reduce((sum, order) => sum + (order.cartId?.totalPrice || 0), 0);

    res.json({ success: true, orders, totalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get single order details
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("cartId")
      .populate("userId", "userName email mobile")
      .populate("assignedEmployee", "name email mobile");

    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// ---------------------- ADMIN VIEW ----------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "userName email mobile area hno street state pincode")
      .populate("cartId")
      .populate("assignedEmployee") // include employee details
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      id: order.orderId,
      assignedAt: order.assignedAt,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      orderStatus: order.orderStatus,
      customer: order.userId?.userName || "N/A",
      phone: order.userId?.mobile || "N/A",
      // service: order.cartId?.items.map((i) => i.item).join(", ") || "N/A",
      service:
        order.cartId?.items.map((i) => `${i.item} x ${i.qty}`).join(", ") ||
        "N/A",
      pickedAt: order.pickedAt,
      deliveredAt: order.deliveredAt,

      qty: order.cartId?.items.map((i) => i.qty) || 0,
      items: order.cartId?.items?.length || 0,
      amount: `₹${order.cartId?.totalPrice || 0}`,

      status: order.orderStatus || "pending",
      pickupImage: order.pickupImage,
      deliveryImage: order.deliveryImage,
      date: order.createdAt.toISOString().split("T")[0],
      address: `${order.userId?.hno || ""}, ${order.userId?.street || ""}, ${
        order.userId?.area || ""
      }, ${order.userId?.state || ""}, ${order.userId?.pincode || ""}`,
      employee: order.assignedEmployee
        ? {
            _id: order.assignedEmployee._id,
            employeeId: order.assignedEmployee.employeeId,
            fullName: order.assignedEmployee.fullName,
            email: order.assignedEmployee.email,
            mobile: order.assignedEmployee.mobile,
            altMobile: order.assignedEmployee.altMobile,
            address: order.assignedEmployee.address,
            aadhar: order.assignedEmployee.aadhar,
            aadhaarFront: order.assignedEmployee.aadhaarFront,
            aadhaarBack: order.assignedEmployee.aadhaarBack,
          }
        : null,
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// PUT /api/orders/employee/verifyCode
export const verifyCode = async (req, res) => {
  try {
    const { orderId, type, code } = req.body;
    const order = await Order.findById(orderId);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (type === "PICKUP" && order.pickupId === code) {
      order.orderStatus = "PICKED_UP";
      order.pickedAt = new Date();
      await order.save();
    } else if (type === "DELIVERY" && order.deliveryId === code) {
      order.orderStatus = "DELIVERED";
      order.deliveredAt = new Date();

      if (!order.pickedAt) {
        order.pickedAt = new Date();
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  console.log(orderId, "cancel orderId");

  try {
    const order = await Order.findOne({ _id: orderId });
    console.log(order, "order");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }

    order.orderStatus = "CANCELLED";
    await order.save();

    return res
      .status(200)
      .json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
