import mongoose from "mongoose";

const DEFAULT_PRIZES = [
  { label: "5% OFF", type: "percent", value: 5, minOrder: 500, weight: 30 },
  { label: "10% OFF", type: "percent", value: 10, minOrder: 1000, weight: 15 },
  { label: "৳50 OFF", type: "flat", value: 50, minOrder: 700, weight: 25 },
  { label: "৳100 OFF", type: "flat", value: 100, minOrder: 1500, weight: 8 },
  { label: "Try again", type: "none", value: 0, minOrder: 0, weight: 22 },
  { label: "৳30 OFF", type: "flat", value: 30, minOrder: 400, weight: 20 },
];

const prizeSchema = new mongoose.Schema(
  {
    label: String,
    type: { type: String, enum: ["percent", "flat", "none"], default: "none" },
    value: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    weight: { type: Number, default: 1 },
  },
  { _id: false }
);

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    announcement: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: "🎉 Free delivery on orders over ৳1500 · Spin the wheel daily for vouchers!" },
    },
    flashSale: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: "Flash Sale" },
      endsAt: { type: Date, default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 2) },
    },
    delivery: {
      dhakaFee: { type: Number, default: 60 },
      outsideFee: { type: Number, default: 120 },
      freeAbove: { type: Number, default: 1500 }, // 0 = never free
      dhakaDays: { type: Number, default: 2 },
      outsideDays: { type: Number, default: 4 },
    },
    coins: {
      enabled: { type: Boolean, default: true },
      earnPer100: { type: Number, default: 1 }, // coins earned per ৳100 spent (on delivery)
      redeemRate: { type: Number, default: 1 }, // ৳ value of 1 coin
      maxRedeemPercent: { type: Number, default: 20 }, // max % of the order payable with coins
    },
    spin: {
      enabled: { type: Boolean, default: true },
      prizes: { type: [prizeSchema], default: () => DEFAULT_PRIZES },
    },
    sections: {
      flash: { type: Boolean, default: true },
      categories: { type: Boolean, default: true },
      budget: { type: Boolean, default: true },
      trending: { type: Boolean, default: true },
      offers: { type: Boolean, default: true },
      newArrivals: { type: Boolean, default: true },
      spin: { type: Boolean, default: true },
      liveActivity: { type: Boolean, default: true },
    },
    contact: {
      phone: { type: String, default: "01568540290" },
      email: { type: String, default: "support@shopbd.com" },
      address: { type: String, default: "Dhaka, Bangladesh" },
      hours: { type: String, default: "Sat–Thu, 10am–8pm" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
