import express from "express";
import { createUser,userLogin,userForgotPassword, updateUser, getUser, getAllUsersWithOrders } from "../controller/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

import multer from "multer";
const upload = multer(); 

router.put("/update", protect, upload.none(), updateUser);


router.post("/register",createUser);
router.post("/login",userLogin);

router.get("/profile", protect, getUser);
// router.put("/update",protect,updateUser)
router.post("/forgotPassword",userForgotPassword)

router.get("/getAllUsersWithOrders",getAllUsersWithOrders)


export default router;


