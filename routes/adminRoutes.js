import express from "express";
import {createadmin,Login}  from "../controller/adminController.js";
import {errorHandler} from "../middlewares/errorHandler.js";


const router=express.Router();


router.post("/register",createadmin);
router.post("/login",Login);

router.use(errorHandler);

export default router;



