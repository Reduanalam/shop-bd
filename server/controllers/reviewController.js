import Review from "../models/Review.js";
import Product from "../models/Product.js";

const recalcRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating = numReviews ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
  await Product.findByIdAndUpdate(productId, { rating, numReviews });
};

export const addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const exists = await Review.findOne({ product: productId, user: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: "You already reviewed this product" });

    const review = await Review.create({ product: productId, user: req.user._id, rating, comment });
    await recalcRating(productId);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "name image");
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const productId = review.product;
    await review.deleteOne();
    await recalcRating(productId);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};
