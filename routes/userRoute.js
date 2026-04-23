import express from "express";
import {
  changePassword,
  deleteUser,
  forgotPassword,
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  updatePasswordAuth,
  updateProfile,
  verification,
  verifyOTP,
} from "../controllers/userController.js";
import { upload } from "../config/cloudinary.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", upload.single("profile_image"), registerUser);
router.post("/verify-mail", verification);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOtp);
router.post("/update-password", changePassword);
router.post(
  "/update-profile/:id",
  upload.single("profile_image"),
  isAuthenticated,
  updateProfile,
);
router.delete("/delete-user/:id", isAuthenticated, deleteUser);
router.get("/profile/:id", isAuthenticated, getProfile);

// Specific Update Routes
router.put("/change-password", isAuthenticated, updatePasswordAuth);

export default router;
