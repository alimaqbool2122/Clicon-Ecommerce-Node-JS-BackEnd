import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true },
);

export const category = mongoose.model("category", categorySchema);
