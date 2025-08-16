import express from "express";
import { createUser,userLogin,userForgotPassword } from "../controller/userController.js";

const router = express.Router();

router.post("/register",createUser);
router.post("/login",userLogin);
router.post("/forgotPassword",userForgotPassword)


export default router;


