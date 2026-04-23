import mongoose from "mongoose";

// Cache the connection across serverless function invocations
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create a new connection promise if one doesn't exist
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(`${process.env.MONGO_URI}/clicon-ecommerce-db`, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log("MongoDB connected successfully");
        return m;
      })
      .catch((error) => {
        cached.promise = null; // Reset so next request can retry
        console.log("MongoDB connection error", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;