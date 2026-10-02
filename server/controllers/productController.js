import slugify from "slugify";
import Product from "../models/Product.js";

// @desc Get all products with search/filter/sort/pagination
// @route GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, brand, minPrice, maxPrice, sort, section, ids, page = 1, limit = 12 } = req.query;

    const query = {};
    if (keyword) query.$text = { $search: keyword };
    
    // Category ID or ObjectId check
    if (category) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      if (isObjectId) {
        query.category = category;
      } else {
        // Jodi Category ID na diye Slug pass kora hoy
        query.category = category; 
      }
    }

    if (brand) query.brand = brand;
    if (ids) query._id = { $in: String(ids).split(",").filter((i) => /^[0-9a-fA-F]{24}$/.test(i)) };
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (section === "offers") {
      query.discount = { $gt: 0 };
      sortOption = { discount: -1 };
    }
    if (section === "flash") query.flashSale = true;
    if (section === "trending") sortOption = { isTrending: -1, sold: -1, rating: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .populate("brand", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single product by id or slug
// @route GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const product = isObjectId
      ? await Product.findById(id).populate("category").populate("brand")
      : await Product.findOne({ slug: id }).populate("category").populate("brand");

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc Create product (admin)
// @route POST /api/admin/products
export const createProduct = async (req, res, next) => {
  try {
    const { title, name } = req.body;
    const productTitle = title || name; // Title ba Name duitor je konotai receive korbe

    const slug = slugify(productTitle, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-5);
    const product = await Product.create({ ...req.body, title: productTitle, slug });
    
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc Update product (admin)
// @route PUT /api/admin/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const { title, name } = req.body;
    const updateData = { ...req.body };

    // Admin jodi edit korar somoy title/name change kore, tobe auto new slug toiri hobe
    if (title || name) {
      const productTitle = title || name;
      updateData.title = productTitle;
      updateData.slug = slugify(productTitle, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-5);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc Delete product (admin)
// @route DELETE /api/admin/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};