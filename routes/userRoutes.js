import express from "express";
import {
  createUser,
  // userLogin,
  // userForgotPassword,
  updateUser,
  getUser,
  getAllUsersWithOrders,
} from "../controller/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

import multer from "multer";
import axios from "axios";
const upload = multer();

router.put("/update/:mobile", protect, upload.none(), updateUser);

router.post("/register", createUser);
// router.post("/login", userLogin);

router.get("/profile/:mobile", getUser);
// router.put("/update",protect,updateUser)
// router.post("/forgotPassword", userForgotPassword);

router.get("/getAllUsersWithOrders", getAllUsersWithOrders);

router.get("/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon" });
  }

  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        format: "json",
        lat,
        lon,
      },
      headers: {
        // 👇 REQUIRED or Nominatim will block (403)
        "User-Agent": "LakshmiIT/1.0 (support@lakshmitech.com)",
        "Accept-Language": "en", // ensures address in English
      },
      timeout: 10000, // 10s timeout to avoid "socket hang up"
    });

    return res.json(response.data);
  } catch (err) {
    console.error("Nominatim error:", err.response?.data || err.message);

    return res.status(500).json({
      error: "Reverse geocoding failed",
      reason: err.response?.data || err.message, // 👈 send real reason to frontend
    });
  }
});

export default router;
