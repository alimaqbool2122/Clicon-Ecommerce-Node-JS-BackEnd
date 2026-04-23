import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: false },
    description: { type: String, required: false },
    price: { type: Number, required: false },
    image: { type: String, required: false },
    status: { type: Boolean, required: false },
  },
  { timestamps: true },
);

export const banner = mongoose.model("banner", bannerSchema);
