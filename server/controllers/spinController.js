import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import { getSettings } from "../utils/pricing.js";

const isSameDay = (a, b) =>
  a && b && new Date(a).toDateString() === new Date(b).toDateString();

// @desc Can the current user spin today?
// @route GET /api/spin/status
export const getSpinStatus = async (req, res, next) => {
  try {
    const settings = await getSettings();
    const user = await User.findById(req.user._id).select("lastSpinAt coins");
    const canSpin = settings.spin.enabled && !isSameDay(user.lastSpinAt, new Date());
    res.json({
      success: true,
      data: { enabled: settings.spin.enabled, canSpin, coins: user.coins, prizes: settings.spin.prizes.map((p) => p.label) },
    });
  } catch (error) {
    next(error);
  }
};

const pickPrize = (prizes) => {
  const total = prizes.reduce((sum, p) => sum + (p.weight || 1), 0);
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= p.weight || 1;
    if (r <= 0) return p;
  }
  return prizes[prizes.length - 1];
};

// @desc Spin the daily wheel — awards a personal coupon (or nothing)
// @route POST /api/spin
export const spinWheel = async (req, res, next) => {
  try {
    const settings = await getSettings();
    if (!settings.spin.enabled) {
      return res.status(400).json({ success: false, message: "Spin & Win is currently disabled" });
    }
    const user = await User.findById(req.user._id).select("lastSpinAt coins");
    if (isSameDay(user.lastSpinAt, new Date())) {
      return res.status(400).json({ success: false, message: "You've already spun today. Come back tomorrow!" });
    }

    const prizes = settings.spin.prizes;
    const index = prizes.findIndex((p) => p === pickPrize(prizes));
    const prize = prizes[index] || prizes[prizes.length - 1];

    user.lastSpinAt = new Date();
    await user.save();

    let coupon = null;
    if (prize.type !== "none") {
      const code = "SPIN" + Math.random().toString(36).slice(2, 8).toUpperCase();
      coupon = await Coupon.create({
        code,
        discountPercent: prize.type === "percent" ? prize.value : 0,
        flatAmount: prize.type === "flat" ? prize.value : 0,
        minOrderAmount: prize.minOrder,
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        owner: user._id,
        source: "spin",
        isPublic: false,
      });
    }

    res.json({
      success: true,
      data: { prizeIndex: index, label: prize.label, coupon },
    });
  } catch (error) {
    next(error);
  }
};
