import { category } from "../models/categoryModel.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { title } = req.body || {};

    // Validate: title is required
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category title is required",
      });
    }

    // Validate: image file is required.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    const normalizedTitle = title.trim().toLowerCase();

    // Check for duplicate category (case-insensitive)
    const existingCategory = await category.findOne({
      title: { $regex: new RegExp(`^${normalizedTitle}$`, "i") },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: `Category already exists`,
      });
    }

    // Save to DB with the uploaded file path from multer
    const newCategory = await category.create({
      title: title.trim(),
      image: req.file.path,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("[Error creating category]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await category.find();
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("[Error fetching categories]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params || {};
    const { title } = req.body || {};

    // Validate: id is required
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Validate: title is required
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category title is required",
      });
    }

    // Validate: image file is required.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    const normalizedTitle = title.trim().toLowerCase();

    // Check for duplicate category (case-insensitive)
    const existingCategory = await category.findOne({
      title: { $regex: new RegExp(`^${normalizedTitle}$`, "i") },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: `Category already exists`,
      });
    }

    // Save to DB with the uploaded file path from multer
    const updatedCategory = await category.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        image: req.file.path,
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("[Error updating category]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params || {};

    // Validate: id is required
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Delete the category
    const deletedCategory = await category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      //   data: deletedCategory,
    });
  } catch (error) {
    console.error("[Error deleting category]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
