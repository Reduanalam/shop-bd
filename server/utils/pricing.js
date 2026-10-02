import Coupon from "../models/Coupon.js";
import Setting from "../models/Setting.js";
import User from "../models/User.js";

export const getSettings = async () => {
  let s = await Setting.findOne({ key: "main" });
  if (!s) s = await Setting.create({ key: "main" });
  return s;
};

export const couponDiscount = (coupon, subtotal) => {
  let d = 0;
  if (coupon.discountPercent > 0) d += (subtotal * coupon.discountPercent) / 100;
  if (coupon.flatAmount > 0) d += coupon.flatAmount;
  return Math.min(Math.round(d), Math.round(subtotal));
};

// Returns { coupon } when usable, otherwise { error }
export const checkCoupon = async (code, subtotal, userId) => {
  if (!code) return { error: "Enter a coupon code" };
  const c = await Coupon.findOne({ code: String(code).trim().toUpperCase(), isActive: true });
  if (!c || c.expiryDate < new Date() || c.isUsed) return { error: "Invalid or expired coupon" };
  if (c.owner && String(c.owner) !== String(userId)) return { error: "Invalid or expired coupon" };
  if (subtotal < c.minOrderAmount) return { error: `Minimum order amount is ৳${c.minOrderAmount}` };
  return { coupon: c };
};

export const shippingFor = (settings, district, subtotal) => {
  const d = settings.delivery;
  if (d.freeAbove > 0 && subtotal >= d.freeAbove) return 0;
  return String(district || "").trim().toLowerCase() === "dhaka" ? d.dhakaFee : d.outsideFee;
};

// Single source of truth for order totals (used by quote + both order flows)
export const computeTotals = async ({ subtotal, couponCode, district, user, useCoins }) => {
  const settings = await getSettings();
  let discount = 0;
  let coupon = null;
  if (couponCode) {
    const r = await checkCoupon(couponCode, subtotal, user._id);
    if (r.coupon) {
      coupon = r.coupon;
      discount = couponDiscount(coupon, subtotal);
    }
  }
  const shippingFee = shippingFor(settings, district, subtotal);

  let coinsUsed = 0;
  const c = settings.coins;
  if (useCoins && c.enabled && c.redeemRate > 0) {
    const fresh = await User.findById(user._id).select("coins");
    const maxCoins = Math.floor(((subtotal - discount) * (c.maxRedeemPercent / 100)) / c.redeemRate);
    coinsUsed = Math.max(0, Math.min(fresh?.coins || 0, maxCoins));
  }
  const coinDiscount = coinsUsed * (c.redeemRate || 1);
  const total = Math.max(0, subtotal - discount - coinDiscount) + shippingFee;
  return { settings, coupon, discount, shippingFee, coinsUsed, coinDiscount, total };
};
