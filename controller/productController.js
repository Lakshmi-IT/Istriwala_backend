import Product from "../model/product.js";
import { STATUSCODE } from "../utils/constants.js";
import { createProductValidation } from "../utils/validation.js";
import mongoose from "mongoose";

export const getAllProducts = async (req, res, next) => {
  try {
    const Products = await Product.find();
    if (!Products) {
      return res.status(STATUSCODE.NO_DATA).json({ message: "No Data" });
    }
    res.status(200).json(Products);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getSingleProduct = async (req, res, next) => {
  try {
    if (!req?.params?.id) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "product id is required" });
    }
    const product = await Product?.findById(req.params.id);
    if (!product) {
      return res.status(STATUSCODE.NO_DATA).json({ message: "No Data" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getVendorProducts = async (req, res, next) => {
  try {
    if (!req?.params?.vendorId) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "vendor id is required" });
    }

    const products = await Product.find({ vandorId: req.params.vendorId });

    if (!products || products.length === 0) {
      return res.status(STATUSCODE.NO_DATA).json({ message: "No products found" });
    }

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// export const createProduct = async (req, res, next) => {
//   try {
//     const validationError = createProductValidation(req.body);
//     if (validationError?.errorArray?.length > 0) {
//       return res
//         .status(STATUSCODE.FAILURE)
//         .json({ message: validationError.errorArray[0] });
//     }

//     console.log(req.file, "req.file");

//     if (!req.file) {
//       return res
//         .status(STATUSCODE.FAILURE)
//         .json({ message: "Image is required" });
//     }

//     console.log(req?.file?.location, "url");

//     const imagePath = req.file ? req.file.location : null;

//     console.log(imagePath, "imagePath");

//     const product = new Product({ ...req.body, image: imagePath });
//     console.log(product, "product");
//     await product.save();
//     res.status(201).json(product);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };


export const createProduct = async (req, res, next) => {
  try {
    const validationError = createProductValidation(req.body);
    if (validationError?.errorArray?.length > 0) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: validationError.errorArray[0] });
    }

    if (
      (!req.files?.images || req.files.images.length === 0) &&
      (!req.files?.videos || req.files.videos.length === 0)
    ) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "At least one image or video is required" });
    }

    const imagePaths = req.files?.images?.map(file => file.location) || [];
    const videoPaths = req.files?.videos?.map(file => file.location) || [];

    const product = new Product({
      ...req.body,
      images: imagePaths,
      videos: videoPaths,
      vandorId: req.user._id,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.log(error);
    next(error);
  }
};


export const updateProduct = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "product id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    console.log("Updating Product:", req.params.id, req.body);

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "product id is required" });
    }
    const product = await Product.findByIdAndDelete(req?.params?.id);
    if (!product) {
      return res.status(STATUSCODE?.NO_DATA).json({ message: "No Data found" });
    }
    res.status(200).json({ message: "product deleted successfully" });
    console.log("product deleted successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
};
