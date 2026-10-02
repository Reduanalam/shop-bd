import slugify from "slugify";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";

// Helper function: Image pathano na thakle default image assign korbe
const getDefaultImage = (name) => {
  const normalized = name.toLowerCase().trim();

  const defaultCategoryImages = {
    electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661",
    fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050",
    groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e",
    clothing: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
    furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  };

  for (const key in defaultCategoryImages) {
    if (normalized.includes(key)) {
      return defaultCategoryImages[key];
    }
  }

  // Dynamic Unsplash fallback placeholder
  return `https://source.unsplash.com/featured/?${encodeURIComponent(name)}`;
};

// ================= CATEGORY CONTROLLERS =================

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, image } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    // User photo na dile auto image choose hobe
    const finalImage = image && image.trim() !== "" ? image : getDefaultImage(name);

    const category = await Category.create({ name, slug, image: finalImage });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, image } = req.body;
    const updateData = { ...req.body };

    if (name) {
      updateData.slug = slugify(name, { lower: true, strict: true });
    }

    // Update korar somoy jodi image empty pathay ebong name thake, auto default image set hobe
    if ((!image || image.trim() === "") && name) {
      updateData.image = getDefaultImage(name);
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ================= BRAND CONTROLLERS =================

export const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const { name, logo } = req.body;
    const finalLogo = logo && logo.trim() !== "" ? logo : getDefaultImage(name);

    const brand = await Brand.create({ ...req.body, logo: finalLogo });
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const { name, logo } = req.body;
    const updateData = { ...req.body };

    // Update korar somoy logo blank thakle default image auto set hobe
    if ((!logo || logo.trim() === "") && name) {
      updateData.logo = getDefaultImage(name);
    }

    const brand = await Brand.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    res.json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }
    res.json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    next(error);
  }
};