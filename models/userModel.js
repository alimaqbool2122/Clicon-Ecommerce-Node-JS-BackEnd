import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: false },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String },
    profile_image: { type: String },
    secondary_email: { type: String, default: null },
    phone_number: { type: String, default: null },
    country: { type: String, default: null },
    state: { type: String, default: null },
    zipcode: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    token: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    lastOtpSent: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
