import { banner } from "../models/bannerModal.js";

// Create Banner
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, description, price, status } = req.body || {};

    // Validate: title is required
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required",
      });
    }

    const normalizedTitle = title.trim().toLowerCase();

    let bannerStatus = true;
    if (status === "false" || status === false) bannerStatus = false;

    // Save to DB with the uploaded file path from multer (if provided)
    const Banner = await banner.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      description: description ? description.trim() : "",
      price: price ? price : 0,
      image: req.file ? req.file.path : null,
      status: bannerStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: Banner,
    });
  } catch (error) {
    console.error("[Error creating banner]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Banners
export const getAllBanners = async (req, res) => {
  try {
    const query = req.query.admin === "true" ? {} : { status: true };
    const banners = await banner.find(query);
    return res.status(200).json({
      success: true,
      message: "Banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    console.error("[Error fetching banners]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update Banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params || {};
    const { title, subtitle, description, price, status } = req.body || {};

    // Validate: id is required
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner ID is required",
      });
    }

    // Prepare update object
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = price;
    if (req.file) updateData.image = req.file.path;

    if (status === "true" || status === true) updateData.status = true;
    else if (status === "false" || status === false) updateData.status = false;

    // Save to DB with the uploaded file path from multer (if provided)
    const updatedBanner = await banner.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("[Error updating banner]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete Banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params || {};

    // Validate: id is required
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner ID is required",
      });
    }

    // Delete the banner
    const deletedBanner = await banner.findByIdAndDelete(id);

    if (!deletedBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
      //   data: deletedBanner,
    });
  } catch (error) {
    console.error("[Error deleting banner]", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
