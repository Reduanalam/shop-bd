import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  title: String,
  image: String,
  price: Number,
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      district: String,
      postalCode: String,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    coinsUsed: { type: Number, default: 0 },
    coinDiscount: { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    coinsAwarded: { type: Boolean, default: false },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash", "nagad"],
      default: "cod",
    },
    // Filled in only for bkash/nagad — manual mobile-banking payment.
    // The customer sends money themselves to the merchant number, then
    // reports which number they sent from and the transaction ID, and the
    // admin verifies it manually against their bKash/Nagad app before
    // marking the order as paid.
    manualPayment: {
      provider: { type: String, enum: ["bkash", "nagad", null], default: null },
      receiverNumber: { type: String, default: null },
      senderNumber: { type: String, default: null },
      transactionId: { type: String, default: null },
    },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    couponCode: { type: String, default: null },
    // "cart" = placed from the shopping cart (possibly a subset of items)
    // "buy_now" = placed directly from a product page, skipping the cart
    source: { type: String, enum: ["cart", "buy_now"], default: "cart" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
