import express from "express";
import {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
} from "../controller/productController.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import upload from "../middlewares/upload.js";
import { protect } from "../middlewares/authMiddleware.js";
import { access } from "../middlewares/accessMiddleware.js";

const router = express.Router();

router.get(
  "/allProducts",
  protect,
  access("ADMIN", "VENDOR", "USER"),
  getAllProducts
);

// router.post(
//   "/createProduct",
//   upload.single("image"),
//   protect,
//   access("ADMIN", "VENDOR"),
//   createProduct
// );

router.post(
  "/createProduct",
  upload.fields([
    { name: "images", maxCount: 20 }, 
    { name: "videos", maxCount: 5 }  
  ]),
  protect,
  access("ADMIN", "VENDOR"),
  createProduct
);




router.get(
  "/singleProduct/:id",
  protect,
  access("ADMIN", "VENDOR", "USER"),
  getSingleProduct
);


// GET /vendors/:vendorId/products
router.get("/vendorProducts/:vendorId", getVendorProducts);

router.post(
  "/updateProduct/:id",
  protect,
  access("ADMIN", "VENDOR"),
  updateProduct
);
router.delete(
  "/deleteProduct/:id",
  protect,
  access("ADMIN", "VENDOR"),
  deleteProduct
);

router.use(errorHandler);

export default router;
