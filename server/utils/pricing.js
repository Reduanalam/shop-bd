import Coupon from "../models/Coupon.js";
import Setting from "../models/Setting.js";
import User from "../models/User.js";

/**
 * Get main application settings
 */
export const getSettings = async () => {
  let s = await Setting.findOne({ key: "main" });

  if (!s) {
    s = await Setting.create({ key: "main" });
  }

  return s;
};

/**
 * Calculate coupon discount
 *
 * If both percentage and flat amount exist,
 * both will be applied.
 */
export const couponDiscount = (coupon, subtotal) => {
  let discount = 0;

  if (coupon.discountPercent > 0) {
    discount +=
      (subtotal * coupon.discountPercent) / 100;
  }

  if (coupon.flatAmount > 0) {
    discount += coupon.flatAmount;
  }

  return Math.min(
    Math.round(discount),
    Math.round(subtotal)
  );
};

/**
 * Validate coupon
 */
export const checkCoupon = async (
  code,
  subtotal,
  userId
) => {
  if (!code || !String(code).trim()) {
    return {
      error: "Enter a coupon code",
    };
  }

  const normalizedCode = String(code)
    .trim()
    .toUpperCase();

  const coupon = await Coupon.findOne({
    code: normalizedCode,
    isActive: true,
  });

  if (!coupon) {
    return {
      error: "Invalid coupon code",
    };
  }

  // Expired
  if (
    coupon.expiryDate &&
    new Date(coupon.expiryDate) < new Date()
  ) {
    return {
      error: "Coupon has expired",
    };
  }

  // Already used
  if (coupon.isUsed) {
    return {
      error: "Coupon has already been used",
    };
  }

  // Owner-only coupon
  if (
    coupon.owner &&
    String(coupon.owner) !== String(userId)
  ) {
    return {
      error: "This coupon is not available for your account",
    };
  }

  // Minimum order amount
  if (
    subtotal < Number(coupon.minOrderAmount || 0)
  ) {
    return {
      error: `Minimum order amount is ৳${coupon.minOrderAmount}`,
    };
  }

  return {
    coupon,
  };
};

/**
 * Calculate shipping fee
 */
export const shippingFor = (
  settings,
  district,
  subtotal
) => {
  const delivery = settings.delivery;

  // Free delivery above configured amount
  if (
    Number(delivery.freeAbove || 0) > 0 &&
    subtotal >= Number(delivery.freeAbove)
  ) {
    return 0;
  }

  const normalizedDistrict = String(
    district || ""
  )
    .trim()
    .toLowerCase();

  if (normalizedDistrict === "dhaka") {
    return Number(delivery.dhakaFee || 0);
  }

  return Number(delivery.outsideFee || 0);
};

/**
 * Single source of truth for all order totals.
 *
 * Used by:
 * - Checkout quote
 * - Cart order
 * - Buy Now order
 */
export const computeTotals = async ({
  subtotal,
  couponCode,
  district,
  user,
  useCoins,
}) => {
  const safeSubtotal = Math.max(
    0,
    Number(subtotal || 0)
  );

  const settings = await getSettings();

  let discount = 0;
  let coupon = null;

  /**
   * Coupon
   */
  if (couponCode) {
    const result = await checkCoupon(
      couponCode,
      safeSubtotal,
      user._id
    );

    if (result.error) {
      const error = new Error(result.error);
      error.statusCode = 400;
      throw error;
    }

    coupon = result.coupon;

    discount = couponDiscount(
      coupon,
      safeSubtotal
    );
  }

  /**
   * Shipping
   */
  const shippingFee = shippingFor(
    settings,
    district,
    safeSubtotal
  );

  /**
   * Coins
   */
  let coinsUsed = 0;

  const coinSettings = settings.coins;

  if (
    useCoins &&
    coinSettings.enabled &&
    Number(coinSettings.redeemRate) > 0
  ) {
    const freshUser = await User.findById(
      user._id
    ).select("coins");

    const maximumRedeemableCoins = Math.floor(
      (
        (safeSubtotal - discount) *
        (Number(coinSettings.maxRedeemPercent) / 100)
      ) /
        Number(coinSettings.redeemRate)
    );

    coinsUsed = Math.max(
      0,
      Math.min(
        Number(freshUser?.coins || 0),
        maximumRedeemableCoins
      )
    );
  }

  const coinDiscount =
    coinsUsed *
    Number(coinSettings.redeemRate || 1);

  /**
   * Final total
   */
  const total =
    Math.max(
      0,
      safeSubtotal -
        discount -
        coinDiscount
    ) + shippingFee;

  return {
    settings,
    coupon,
    discount,
    shippingFee,
    coinsUsed,
    coinDiscount,
    total,
  };
};