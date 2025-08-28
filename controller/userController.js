import User from "../model/user.js";
import bcrypt from "bcryptjs";
import { STATUSCODE } from "../utils/constants.js";
import { userLoginValidation, userValidation } from "../utils/validation.js";
import jwt from "jsonwebtoken";
import { roleType } from "../utils/roles.js";
import { sendEmail } from "../middlewares/emailer.js";


import Order from "../model/orders.js";
import Cart from "../model/cart.js"; // if totalPrice is inside Cart


export const getAllUsersWithOrders = async (req, res, next) => {
  try {
    // fetch all users
    const users = await User.find().select("-password -forgotOtp");

    // format each user with extra details
    const formattedUsers = await Promise.all(
      users.map(async (user, index) => {
        // get all orders of this user
        const orders = await Order.find({ userId: user._id }).populate("cartId");

        const totalOrders = orders.length;

        // calculate total spent from carts
        const totalSpent = orders.reduce(
          (sum, order) => sum + (order.cartId?.totalPrice || 0),
          0
        );

        // last order date
        const lastOrder =
          totalOrders > 0
            ? orders[0].createdAt.toISOString().split("T")[0]
            : null;

        return {
          id: `USR-${(index + 1).toString().padStart(3, "0")}`, // custom ID
          name: user.userName,
          email: user.email,
          phone: user.mobile,
          address: `${user.hno || ""}, ${user.street || ""}, ${user.area || ""}, ${user.state || ""}, ${user.pincode || ""}`,
          totalOrders,
          totalSpent: `₹${totalSpent}`,
          lastOrder,
          joinDate: user.createdAt?.toISOString().split("T")[0],
        };
      })
    );

    res
      .status(STATUSCODE.SUCCESS)
      .json({ success: true, users: formattedUsers });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { userName, mobile, email, password } = req.body;
    console.log(req.body,"req.body")

    const validationError = userValidation(req.body);
    if (userValidation.errorArray) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: validationError.errorArray[0] });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password || "", 10);

    const user = await User.create({
      userName: userName || "",
      mobile: mobile || "",
      alternativeMobile: req.body.alternativeMobile || "",
      email: email || "",
      password: hashedPassword || "",
      hno: req.body.hno || "",
      street: req.body.street || "",
      area: req.body.area || "",
      address: req.body.address || "",
      state: req.body.state || "",
      pincode: req.body.pincode || "",
      forgotOtp: req.body.forgotOtp || "",
    });

    if (!user) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "user not created" });
    }

    const token = jwt.sign(
      { userId: user._id, roleType: roleType.USER },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .status(STATUSCODE.SUCCESS)
      .json({ token, message: "user created successfully" });
  } catch (error) {
    next(error);
  }
};


export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validationError = userLoginValidation(req.body);

    if (validationError.errorArray) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: validationError.errorArray[0] });
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(STATUSCODE.FAILURE).json({ message: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);
    if (!isMatch) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { userId: userExists._id, roleType: roleType.USER },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    if (!token) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "token not created" });
    }
    res
      .status(STATUSCODE.SUCCESS)
      .json({ token, message: "user logged in successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const userId = req.user.userId; // ✅ now available

    const user = await User.findById(userId).select("-password -forgotOtp");

    if (!user) {
      return res.status(STATUSCODE.FAILURE).json({ message: "User not found" });
    }

    res
      .status(STATUSCODE.SUCCESS)
      .json({ message: "User fetched successfully", user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const updateData = req.body;

    console.log(req.body,"req.body")


    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(STATUSCODE.FAILURE).json({ message: "User not found" });
    }

    res
      .status(STATUSCODE.SUCCESS)
      .json({ message: "Profile updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const userForgotPassword = async (req, res, next) => {
  try {
    const { email, password, conformPassword } = req.body;

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(STATUSCODE.FAILURE).json({ message: "user not found" });
    }

    const generateOtp = Math.floor(1000 + Math.random() * 9000);

    // prepare email
    const subject = "Your OTP Code";
    const message = `Hi ${
      userExists.userName || "User"
    },\n\nYour OTP code is: ${generateOtp}\nIt will expire in 10 minutes.\n\nThanks,\n`;

    const emailSent = await sendEmail(email, subject, message);

    if (!emailSent) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Failed to send OTP" });
    }

    // optionally save OTP in DB or cache here

    const otp = await User.findOneAndUpdate(
      { email },
      { forgotOtp: generateOtp },
      { new: true }
    );
    if (!otp) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "OTP not created" });
    }

    return res
      .status(STATUSCODE.SUCCESS)
      .json({ message: "OTP sent to email" });

    // if(password!==conformPassword){
    //     return res.status(STATUSCODE.FAILURE).json({message:"Password does not match"});
    // }

    // const hashedPassword=await bcrypt.hash(password,10);
    // const user=await User.findOneAndUpdate({email},{password:hashedPassword},{new:true});
    // if(!user){
    //     return res.status(STATUSCODE.FAILURE).json({message:"user not updated"});
    // }

    // const token=jwt.sign({userId:user._id,roleType:roleType.USER},process.env.JWT_SECRET,{expiresIn:"7d"});
    // if(!token){
    //     return res.status(STATUSCODE.FAILURE).json({message:"token not created"});
    // }
    // res.status(STATUSCODE.SUCCESS).json({token,message:"Password changed successfully"});
  } catch (error) {
    next(error);
  }
};
