import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../config/cloudinary.js";
import {
  createBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from "../controllers/bannerController.js";

const router = express.Router();

router.post(
  "/create-banner",
  isAuthenticated,
  upload.single("image"),
  createBanner,
);

router.get("/get-banners", getAllBanners);

router.put(
  "/update-banner/:id",
  isAuthenticated,
  upload.single("image"),
  updateBanner,
);

router.delete("/delete-banner/:id", isAuthenticated, deleteBanner);

export default router;
