import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    image: { type: String, default: "" },
    gallery: [{ type: String }],
    isTrending: { type: Boolean, default: false },
    flashSale: { type: Boolean, default: false },
    sold: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

productSchema.virtual("finalPrice").get(function () {
  return this.price - (this.price * this.discount) / 100;
});
productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
