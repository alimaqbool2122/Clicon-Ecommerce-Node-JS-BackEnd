import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../config/cloudinary.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post(
  "/create-product",
  isAuthenticated,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "thumbnails", maxCount: 6 },
  ]),
  createProduct,
);

router.get("/get-all-products", getAllProducts);

router.put(
  "/update-product/:id",
  isAuthenticated,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "thumbnails", maxCount: 6 },
  ]),
  updateProduct,
);

router.delete("/delete-product/:id", isAuthenticated, deleteProduct);
router.get("/product-details/:id", getSingleProduct);

export default router;
