import Banner from "../models/Banner.js";

// @desc    Get active banners for the homepage slider
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all banners incl. inactive (admin)
// @route   GET /api/admin/banners
// @access  Private/Admin
export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new banner
// @route   POST /api/admin/banners
// @access  Private/Admin
export const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Update banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    next(error);
  }
};