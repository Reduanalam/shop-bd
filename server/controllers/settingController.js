import { getSettings } from "../utils/pricing.js";
import Setting from "../models/Setting.js";

// @desc Get public site settings (announcement, flash sale timer, section toggles, delivery info)
// @route GET /api/settings
export const getPublicSettings = async (req, res, next) => {
  try {
    const s = await getSettings();
    res.json({
      success: true,
      data: {
        announcement: s.announcement,
        flashSale: s.flashSale,
        delivery: s.delivery,
        coins: { enabled: s.coins.enabled, earnPer100: s.coins.earnPer100, redeemRate: s.coins.redeemRate, maxRedeemPercent: s.coins.maxRedeemPercent },
        spin: { enabled: s.spin.enabled },
        sections: s.sections,
        contact: s.contact,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update site settings (admin)
// @route PUT /api/admin/settings
export const updateSettings = async (req, res, next) => {
  try {
    const s = await getSettings();
    const allowed = ["announcement", "flashSale", "delivery", "coins", "spin", "sections", "contact"];
    allowed.forEach((key) => {
      if (req.body[key]) Object.assign(s[key], req.body[key]);
    });
    await s.save();
    res.json({ success: true, data: s });
  } catch (error) {
    next(error);
  }
};

// @desc Get full settings incl. spin prize weights (admin)
// @route GET /api/admin/settings
export const getAdminSettings = async (req, res, next) => {
  try {
    const s = await getSettings();
    res.json({ success: true, data: s });
  } catch (error) {
    next(error);
  }
};
