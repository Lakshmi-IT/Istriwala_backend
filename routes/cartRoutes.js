import express from "express";
import {
  addToCart,
  getCart,
  clearCart,
  updateCartItem,
  removeCartItem,
} from "../controller/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.delete("/clear", protect, clearCart);

// New endpoints
router.patch("/update-item", protect, updateCartItem);
router.delete("/remove-item", protect, removeCartItem); 


export default router;


