import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post(
  "/create-category",
  isAuthenticated,
  upload.single("image"),
  createCategory,
);

router.get("/get-allcategories", isAuthenticated, getAllCategories);
router.put(
  "/update-category/:id",
  isAuthenticated,
  upload.single("image"),
  updateCategory,
);

router.delete("/delete-category/:id", isAuthenticated, deleteCategory);

export default router;
