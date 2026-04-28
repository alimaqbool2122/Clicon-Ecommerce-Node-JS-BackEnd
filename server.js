import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import bannerRoute from "./routes/bannerRoute.js";
import productRoute from "./routes/productRoute.js";

const app = express();

const PORT = process.env.PORT || 3000;

// CORS — must be before any routes
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins - callback with true to allow all
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);
app.options("*", cors());

app.use(express.json());

// DB middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(503).json({ error: "Database unavailable" });
  }
});

// Root health check route — fixes Vercel 404
app.get("/", (req, res) => {
  res.json({ message: "Clicon Ecommerce API is running ✅" });
});

app.use("/", userRoute);
app.use("/", categoryRoute);
app.use("/", bannerRoute);
app.use("/", productRoute);

// Connect DB
connectDB();

// Only run local server in development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
  });
}

export default app;
