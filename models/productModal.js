import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: false },
    discountPrice: { type: Number, required: false },
    mainImage: { type: String, required: false },
    badge: [{ type: String, required: false }],
    stock: { type: Boolean, required: false },
    category: { type: String, required: false },
    brand: { type: String, required: false },
    model: { type: String, required: false },
    thumbnails: [
      {
        thumbnail1: { type: String, required: false },
        thumbnail2: { type: String, required: false },
        thumbnail3: { type: String, required: false },
        thumbnail4: { type: String, required: false },
        thumbnail5: { type: String, required: false },
        thumbnail6: { type: String, required: false },
      },
    ],
    size: [{ type: String, required: false }],
    memory: [{ type: String, required: false }],
    color: [{ type: String, required: false }],
    storage: [{ type: String, required: false }],
  },
  { timestamps: true },
);

export const product = mongoose.model("product", productSchema);
