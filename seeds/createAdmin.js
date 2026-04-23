import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";

const createAdminSeed = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/clicon-ecommerce-db`);
    console.log("MongoDB connected for seeding");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "112233@Qw";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin already exists with email:", adminEmail);
      mongoose.connection.close();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = await User.create({
      name: "Muhammad Ali",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isLoggedIn: false,
    });

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdminSeed();
