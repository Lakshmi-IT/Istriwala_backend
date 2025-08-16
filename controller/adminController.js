import Admin from "../model/admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { STATUSCODE } from "../utils/constants.js";
import { adminRegister, adminLogin } from "../utils/validation.js";
import { roleType } from "../utils/roles.js";

export const createadmin = async (req, res, next) => {
  try {
    const { adminName, email, password } = req.body;

    const validationError = adminRegister(req.body);

    if (validationError.errorArray) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: validationError.errorArrays[0] });
    }

    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "admin already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      adminName,
      email,
      password: hashedPassword,
    });
    
    const token = jwt.sign({ adminId: admin._id, roleType: roleType.ADMIN }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(STATUSCODE.SUCCESS)
      .json({ token, message: "admin created successfully" });
  } catch (error) {
    next(error);
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validationError = adminLogin(req.body);
    if (validationError.errorArray) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: validationError.errorArrays[0] });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "admin does not exist" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(STATUSCODE.FAILURE).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign({ adminId: admin._id, roleType: roleType.ADMIN }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(STATUSCODE.SUCCESS)
      .json({ token, message: "admin logged in successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, password, conformPassword } = req.body;

    const isExist = await Admin.findOne({ email });
    console.log(isExist);
    if (!isExist) {
      return res.status(STATUSCODE.FAILURE).json({ message: "admin not found" });
    }

    if (password !== conformPassword) {
     return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Password does not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await admin.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    const token = jwt.sign({ adminId: admin._id , roleType: roleType.ADMIN}, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(STATUSCODE.SUCCESS)
      .json({ token, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
