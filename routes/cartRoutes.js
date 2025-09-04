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

router.post("/add/:mobile", addToCart);
router.get("/:mobile", getCart);
router.delete("/clear", protect, clearCart);

// New endpoints
router.patch("/update-item/:mobile", updateCartItem);
router.delete("/remove-item/:mobile", removeCartItem); 


export default router;


