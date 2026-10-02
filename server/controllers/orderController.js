import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { computeTotals, getSettings } from "../utils/pricing.js";

const buildManualPayment = (paymentMethod, body) => {
  if (paymentMethod !== "bkash" && paymentMethod !== "nagad") return undefined;
  const { senderNumber, transactionId } = body.manualPayment || {};
  if (!senderNumber || !transactionId) {
    const err = new Error(
      "Please provide the number you sent money from and the Transaction ID after paying"
    );
    err.statusCode = 400;
    throw err;
  }
  return { provider: paymentMethod, receiverNumber: "01568540290", senderNumber, transactionId };
};

const unitPrice = (p) => p.price - (p.price * p.discount) / 100;

// After an order row is created: burn owner-only voucher, spend coins, update stock + sold
const applySideEffects = async (order, items, coupon) => {
  for (const it of items) {
    await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.quantity, sold: it.quantity } });
  }
  if (coupon?.owner) await Coupon.findByIdAndUpdate(coupon._id, { isUsed: true });
  if (order.coinsUsed > 0) await User.findByIdAndUpdate(order.user, { $inc: { coins: -order.coinsUsed } });
};

// Give stock / coins / personal voucher back when an order is cancelled or returned
const restoreOrder = async (order) => {
  for (const it of order.items) {
    await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.quantity, sold: -it.quantity } });
  }
  if (order.coinsUsed > 0) await User.findByIdAndUpdate(order.user, { $inc: { coins: order.coinsUsed } });
  if (order.couponCode) await Coupon.updateOne({ code: order.couponCode, owner: { $ne: null } }, { isUsed: false });
};

// @desc Price preview for checkout (display only — real totals are recomputed on order)
// @route POST /api/orders/quote
export const quoteOrder = async (req, res, next) => {
  try {
    const { subtotal = 0, district, couponCode, useCoins } = req.body;
    const t = await computeTotals({ subtotal: Number(subtotal), couponCode, district, user: req.user, useCoins });
    const me = await User.findById(req.user._id).select("coins");
    res.json({
      success: true,
      data: {
        discount: t.discount,
        shippingFee: t.shippingFee,
        coinsUsed: t.coinsUsed,
        coinDiscount: t.coinDiscount,
        total: t.total,
        couponValid: !!t.coupon,
        coinBalance: me?.coins || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Place a new order from the user's cart (all items, or a selected subset)
// @route POST /api/orders
export const placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, selectedItems, useCoins } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const itemsToOrder =
      Array.isArray(selectedItems) && selectedItems.length > 0
        ? cart.items.filter((item) => selectedItems.includes(item.product._id.toString()))
        : cart.items;

    if (itemsToOrder.length === 0) {
      return res.status(400).json({ success: false, message: "No items selected for checkout" });
    }
    for (const it of itemsToOrder) {
      if (it.product.stock < it.quantity) {
        return res.status(400).json({ success: false, message: `Not enough stock for ${it.product.title}` });
      }
    }

    let manualPayment;
    try {
      manualPayment = buildManualPayment(paymentMethod, req.body);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ success: false, message: err.message });
    }

    let subtotal = 0;
    const orderItems = itemsToOrder.map((item) => {
      const price = unitPrice(item.product);
      subtotal += price * item.quantity;
      return {
        product: item.product._id,
        title: item.product.title,
        image: item.product.image,
        price,
        quantity: item.quantity,
      };
    });

    const t = await computeTotals({ subtotal, couponCode, district: shippingAddress?.district, user: req.user, useCoins });

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      discount: t.discount,
      coinsUsed: t.coinsUsed,
      coinDiscount: t.coinDiscount,
      shippingFee: t.shippingFee,
      total: t.total,
      paymentMethod,
      manualPayment,
      paymentStatus: "pending",
      couponCode: t.coupon ? t.coupon.code : null,
      source: "cart",
    });

    await applySideEffects(order, orderItems, t.coupon);

    const orderedIds = itemsToOrder.map((i) => i.product._id.toString());
    cart.items = cart.items.filter((item) => !orderedIds.includes(item.product._id.toString()));
    await cart.save();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc Place a direct order for a single product ("Buy Now"), skipping the cart
// @route POST /api/orders/direct
export const placeDirectOrder = async (req, res, next) => {
  try {
    const { productId, quantity = 1, shippingAddress, paymentMethod, couponCode, useCoins } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock available" });
    }

    let manualPayment;
    try {
      manualPayment = buildManualPayment(paymentMethod, req.body);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ success: false, message: err.message });
    }

    const price = unitPrice(product);
    const subtotal = price * quantity;
    const t = await computeTotals({ subtotal, couponCode, district: shippingAddress?.district, user: req.user, useCoins });

    const items = [{ product: product._id, title: product.title, image: product.image, price, quantity }];
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      discount: t.discount,
      coinsUsed: t.coinsUsed,
      coinDiscount: t.coinDiscount,
      shippingFee: t.shippingFee,
      total: t.total,
      paymentMethod,
      manualPayment,
      paymentStatus: "pending",
      couponCode: t.coupon ? t.coupon.code : null,
      source: "buy_now",
    });

    await applySideEffects(order, items, t.coupon);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc Get logged in user's orders
// @route GET /api/orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc Get single order (owner or admin)
// @route GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc Cancel an order (owner, only if pending)
// @route PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (order.orderStatus !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending orders can be cancelled" });
    }
    order.orderStatus = "cancelled";
    await order.save();
    await restoreOrder(order);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc Get all orders (admin)
// @route GET /api/admin/orders
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc Update order status (admin)
// @route PUT /api/admin/orders/:id
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const prev = order.orderStatus;
    const closed = ["cancelled", "returned"];

    if (orderStatus && orderStatus !== prev) {
      if (closed.includes(prev)) {
        return res.status(400).json({ success: false, message: "Cancelled/returned orders can't be re-opened" });
      }
      order.orderStatus = orderStatus;

      if (closed.includes(orderStatus)) await restoreOrder(order);

      if (orderStatus === "delivered") {
        if (order.paymentMethod === "cod") order.paymentStatus = "paid";
        if (!order.coinsAwarded) {
          const s = await getSettings();
          if (s.coins.enabled) {
            const base = order.subtotal - order.discount - order.coinDiscount;
            const earned = Math.max(0, Math.floor((base / 100) * s.coins.earnPer100));
            order.coinsEarned = earned;
            if (earned > 0) await User.findByIdAndUpdate(order.user, { $inc: { coins: earned } });
          }
          order.coinsAwarded = true;
        }
      }
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
