import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyMail } from "../emailVerify/verifyMail.js";
import { sendOtpMail } from "../emailVerify/sendOtpMail.js";

//  For Registration
export const registerUser = async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      secondary_email,
      password,
      password_confirmation,
      phone_number,
      country,
      state,
      zipcode,
    } = req.body;

    // Basic Validation
    if (!name || !email || !password || !password_confirmation) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, and password confirmation are required",
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        // 409 Conflict is more semantic for existing resources
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Prepare User Data
    const hashedPassword = await bcrypt.hash(password, 12); // Industry standard rounds: 12
    const newUser = new User({
      username: username || null,
      name,
      email: email.toLowerCase(),
      secondary_email: secondary_email || null,
      password: hashedPassword,
      phone_number: phone_number || null,
      country: country || null,
      state: state || null,
      zipcode: zipcode || null,
      role: "user",
      profile_image: req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : null,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    newUser.token = token;
    await newUser.save();

    // Send Verification Email (Awaited for reliability)
    try {
      await verifyMail(token, email);
    } catch (mailError) {
      console.error("Email verification failed to send:", mailError);
    }

    // Secure Response (Filtering sensitive data)
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.token;
    delete userResponse.otp;

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: userResponse,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// For Verification
export const verification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "The registration token has expired",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Token verification failed",
      });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent re-verification if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    user.token = null;
    user.isVerified = true;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// For Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find User (Case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    // Verify Credentials
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check Verification Status
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in.",
      });
    }

    // Generate Access Token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    // Update Login State
    user.isLoggedIn = true;
    await user.save();

    // Secure Response (Filter sensitive fields)
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.token;
    delete userResponse.otp;
    delete userResponse.otpExpiry;

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}`,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// For Logout
export const logoutUser = async (req, res) => {
  try {
    const userId = req.userId;
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });
    return res.status(200).json({
      success: true,
      message: "You've been successfully logged out.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.userId;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format.",
      });
    }

    // Privacy Check: Only allow the owner to view their private profile
    if (authenticatedUserId.toString() !== id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own profile.",
      });
    }

    // Optimized User Fetch (Exclude sensitive fields)
    const user = await User.findById(id).select(
      "-password -token -otp -otpExpiry",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.userId;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format.",
      });
    }

    // Privacy Check
    if (authenticatedUserId.toString() !== id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own profile.",
      });
    }

    // Find User
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Extract and Sanitize Input
    const body = req.body?.data ? req.body.data : req.body;
    const {
      username,
      name,
      email,
      password,
      password_confirmation,
      secondary_email,
      phone_number,
      country,
      state,
      zipcode,
    } = body;

    // Handle Conflicts (Username/Email)
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res
          .status(409)
          .json({ success: false, message: "Email is already taken." });
      }
      user.email = email.toLowerCase();
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res
          .status(409)
          .json({ success: false, message: "Username is already taken." });
      }
      user.username = username;
    }

    // Handle Password Update (Secure)
    if (password) {
      if (password !== password_confirmation) {
        return res
          .status(400)
          .json({ success: false, message: "Passwords do not match." });
      }
      user.password = await bcrypt.hash(password, 12);
    }

    // Update Other Fields
    if (name !== undefined) user.name = name;
    if (secondary_email !== undefined) user.secondary_email = secondary_email;
    if (phone_number !== undefined) user.phone_number = phone_number;
    if (country !== undefined) user.country = country;
    if (state !== undefined) user.state = state;
    if (zipcode !== undefined) user.zipcode = zipcode;

    // Handle Profile Image (File Upload Support)
    if (req.file) {
      user.profile_image = req.file.path;
    } else if (req.body.profile_image !== undefined) {
      user.profile_image = req.body.profile_image;
    }

    await user.save();

    // Secure Response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.token;
    delete userResponse.otp;
    delete userResponse.otpExpiry;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: userResponse,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// For ForgetPassword
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const sanitizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail });

    // user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found.",
      });
    }

    // Prevent sending a new OTP if the current one is still valid
    if (user.otp && user.otpExpiry && user.otpExpiry > Date.now()) {
      return res.status(429).json({
        success: false,
        message: "An OTP has already been sent to your email. Check email",
      });
    }

    // Generate OTP and Expiry (10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    // Send OTP Mail (Awaited for reliability)
    try {
      await sendOtpMail(sanitizedEmail, otp);
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// update-password
export const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email } = req.body;

    // Validation
    if (!newPassword || !confirmPassword || !email) {
      return res.status(400).json({
        success: false,
        message: "newPassword, confirmPassword and email are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Find User (Case-insensitive)
    const sanitizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found.",
      });
    }

    // Strict OTP Enforcement
    if (!user.otpVerified) {
      return res.status(401).json({
        success: false,
        message: "OTP verification is required before resetting your password.",
      });
    }

    // Update Password (Secure Hashing)
    user.password = await bcrypt.hash(newPassword, 12);

    // Reset OTP State
    user.otpVerified = false;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required.",
      });
    }

    // Find User
    const sanitizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found.",
      });
    }

    // Status Check
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP generated or it has already been verified.",
      });
    }

    // Expiry Check
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Code Comparison
    if (otp !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please check email.",
      });
    }

    // Success: Mark OTP as verified and clear temporary state
    user.otp = null;
    user.otpExpiry = null;
    user.otpVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Find User (Case-insensitive)
    const sanitizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found.",
      });
    }

    // Check if OTP already exists
    if (user.lastOtpSent) {
      const timePassed = Date.now() - new Date(user.lastOtpSent).getTime();
      const coolDown = 60 * 1000; // 60 seconds

      if (timePassed < coolDown) {
        const remaining = Math.ceil((coolDown - timePassed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting another OTP.`,
        });
      }
    }

    // Generate New OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = newOtp;
    user.otpExpiry = expiry;
    user.lastOtpSent = new Date();
    user.otpVerified = false;

    await user.save();

    // Send OTP email
    try {
      await sendOtpMail(sanitizedEmail, newOtp);
    } catch (mailError) {
      console.error("Failed to resend OTP email:", mailError);
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const authenticatedUser = req.user;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format.",
      });
    }

    // Only allow self-deletion OR admin-deletion
    const isOwner = authenticatedUser._id.toString() === id.toString();
    const isAdmin = authenticatedUser.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own account.",
      });
    }

    // Find and Delete User
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Change Password (Authenticated)
export const updatePasswordAuth = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password, and confirmation are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
    }

    // Find User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password.",
      });
    }

    // Update Password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Update Password Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
