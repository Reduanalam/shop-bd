import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    flatAmount: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date, required: true },
    minOrderAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // shown in every customer's voucher wallet when true
    isPublic: { type: Boolean, default: false },
    // set for personal vouchers (e.g. won on the lucky spin)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    source: { type: String, enum: ["admin", "spin"], default: "admin" },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
