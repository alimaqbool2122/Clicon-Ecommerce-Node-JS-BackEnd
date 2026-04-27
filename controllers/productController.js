import { product } from "../models/productModal.js";

//  Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      mainImage,
      badge,
      stock,
      category,
      brand,
      model,
      thumbnails,
      size,
      memory,
      color,
      storage,
    } = req.body || {};

    // Validate: title is required
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product title is required",
      });
    }

    const normalizedTitle = title.trim().toLowerCase();

    let isStock = true;
    if (stock === "false" || stock === false) isStock = false;

    // Save to DB with the uploaded file path from multer (if provided)
    const Product = await product.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      price: price ? price : 0,
      discountPrice: discountPrice ? discountPrice : 0,
      mainImage: req.files?.mainImage?.[0]?.path || null,
      badge: badge ? badge : [],
      stock: isStock,
      category: category ? category : "",
      brand: brand ? brand : "",
      model: model ? model : "",
      thumbnails: req.files?.thumbnails?.map((file) => file.path) || [],
      size: size ? size : [],
      memory: memory ? memory : [],
      color: color ? color : [],
      storage: storage ? storage : [],
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: Product,
    });
  } catch (error) {
    console.error("[Error creating product]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await product.find();
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("[Error fetching products]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get sinle product (by using its id)
export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params || {};

    // Validate: id is required
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Get from DB
    const singleProduct = await product.findById(id);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: singleProduct,
    });
  } catch (error) {
    console.error("[Error fetching product]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params || {};
    const {
      title,
      description,
      price,
      discountPrice,
      mainImage,
      badge,
      stock,
      category,
      brand,
      model,
      thumbnails,
      size,
      memory,
      color,
      storage,
    } = req.body || {};

    // Validate: id is required
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Prepare update object
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = price;
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
    if (req.files?.mainImage?.[0])
      updateData.mainImage = req.files.mainImage[0].path;
    if (badge) updateData.badge = badge;
    if (stock !== undefined) {
      updateData.stock = stock === "true" || stock === true;
    }
    if (category) updateData.category = category.trim();
    if (brand) updateData.brand = brand.trim();
    if (model) updateData.model = model.trim();
    if (req.files?.thumbnails?.length)
      updateData.thumbnails = req.files.thumbnails.map((f) => f.path);
    if (size) updateData.size = size;
    if (memory) updateData.memory = memory;
    if (color) updateData.color = color;
    if (storage) updateData.storage = storage;

    // Save to DB with the uploaded file path from multer (if provided)
    const updatedProduct = await product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("[Error updating product]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params || {};

    // Validate: id is required
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Delete from DB
    const deletedProduct = await product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      //   data: deletedProduct,
    });
  } catch (error) {
    console.error("[Error deleting product]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
