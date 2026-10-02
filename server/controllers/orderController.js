import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

import {
  computeTotals,
  getSettings,
} from "../utils/pricing.js";

/**
 * Build manual payment information
 */
const buildManualPayment = (
  paymentMethod,
  body
) => {
  if (
    paymentMethod !== "bkash" &&
    paymentMethod !== "nagad"
  ) {
    return undefined;
  }

  const {
    senderNumber,
    transactionId,
  } = body.manualPayment || {};

  if (!senderNumber || !transactionId) {
    const error = new Error(
      "Please provide the number you sent money from and the Transaction ID after paying"
    );

    error.statusCode = 400;

    throw error;
  }

  return {
    provider: paymentMethod,
    receiverNumber: "01568540290",
    senderNumber,
    transactionId,
  };
};

/**
 * Calculate product unit price after product discount
 */
const unitPrice = (product) => {
  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);

  return price -
    (price * discount) / 100;
};

/**
 * Apply order side effects
 *
 * - Reduce stock
 * - Increase sold count
 * - Mark owner coupon as used
 * - Deduct coins
 */
const applySideEffects = async (
  order,
  items,
  coupon
) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: -item.quantity,
          sold: item.quantity,
        },
      }
    );
  }

  if (coupon?.owner) {
    await Coupon.findByIdAndUpdate(
      coupon._id,
      {
        isUsed: true,
      }
    );
  }

  if (order.coinsUsed > 0) {
    await User.findByIdAndUpdate(
      order.user,
      {
        $inc: {
          coins: -order.coinsUsed,
        },
      }
    );
  }
};

/**
 * Restore order side effects
 *
 * Used when order is cancelled/returned.
 */
const restoreOrder = async (order) => {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: item.quantity,
          sold: -item.quantity,
        },
      }
    );
  }

  if (order.coinsUsed > 0) {
    await User.findByIdAndUpdate(
      order.user,
      {
        $inc: {
          coins: order.coinsUsed,
        },
      }
    );
  }

  if (order.couponCode) {
    await Coupon.updateOne(
      {
        code: order.couponCode,
        owner: {
          $ne: null,
        },
      },
      {
        isUsed: false,
      }
    );
  }
};

/**
 * @desc Price preview for checkout
 * @route POST /api/orders/quote
 */
export const quoteOrder = async (
  req,
  res,
  next
) => {
  try {
    const {
      subtotal = 0,
      district,
      couponCode,
      useCoins,
    } = req.body;

    const totals = await computeTotals({
      subtotal: Number(subtotal),
      couponCode,
      district,
      user: req.user,
      useCoins,
    });

    const me = await User.findById(
      req.user._id
    ).select("coins");

    res.json({
      success: true,
      data: {
        discount: totals.discount,
        shippingFee: totals.shippingFee,
        coinsUsed: totals.coinsUsed,
        coinDiscount: totals.coinDiscount,
        total: totals.total,
        couponValid: Boolean(
          totals.coupon
        ),
        couponCode:
          totals.coupon?.code || null,
        coinBalance: me?.coins || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Place order from cart
 * @route POST /api/orders
 */
export const placeOrder = async (
  req,
  res,
  next
) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      couponCode,
      selectedItems,
      useCoins,
    } = req.body;

    /**
     * Get cart
     */
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (
      !cart ||
      cart.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    /**
     * Selected products
     */
    const itemsToOrder =
      Array.isArray(selectedItems) &&
      selectedItems.length > 0
        ? cart.items.filter((item) =>
            selectedItems.includes(
              item.product._id.toString()
            )
          )
        : cart.items;

    if (itemsToOrder.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No items selected for checkout",
      });
    }

    /**
     * Stock validation
     */
    for (const item of itemsToOrder) {
      if (
        item.product.stock <
        item.quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.product.title}`,
        });
      }
    }

    /**
     * Manual payment
     */
    let manualPayment;

    try {
      manualPayment =
        buildManualPayment(
          paymentMethod,
          req.body
        );
    } catch (error) {
      return res.status(
        error.statusCode || 400
      ).json({
        success: false,
        message: error.message,
      });
    }

    /**
     * Build order items
     */
    let subtotal = 0;

    const orderItems =
      itemsToOrder.map((item) => {
        const price =
          unitPrice(item.product);

        subtotal +=
          price * item.quantity;

        return {
          product:
            item.product._id,
          title:
            item.product.title,
          image:
            item.product.image,
          price,
          quantity:
            item.quantity,
        };
      });

    /**
     * Calculate real totals
     *
     * IMPORTANT:
     * Frontend discount is ignored.
     */
    const totals =
      await computeTotals({
        subtotal,
        couponCode,
        district:
          shippingAddress?.district,
        user: req.user,
        useCoins,
      });

    /**
     * Create order
     */
    const order =
      await Order.create({
        user: req.user._id,

        items: orderItems,

        shippingAddress,

        subtotal,

        discount:
          totals.discount,

        coinsUsed:
          totals.coinsUsed,

        coinDiscount:
          totals.coinDiscount,

        shippingFee:
          totals.shippingFee,

        total:
          totals.total,

        paymentMethod,

        manualPayment,

        paymentStatus:
          "pending",

        couponCode:
          totals.coupon
            ? totals.coupon.code
            : null,

        source: "cart",
      });

    /**
     * Update stock/coupon/coins
     */
    await applySideEffects(
      order,
      orderItems,
      totals.coupon
    );

    /**
     * Remove ordered products
     * from cart
     */
    const orderedIds =
      itemsToOrder.map(
        (item) =>
          item.product._id.toString()
      );

    cart.items =
      cart.items.filter(
        (item) =>
          !orderedIds.includes(
            item.product._id.toString()
          )
      );

    await cart.save();

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Place direct Buy Now order
 * @route POST /api/orders/direct
 */
export const placeDirectOrder = async (
  req,
  res,
  next
) => {
  try {
    const {
      productId,
      quantity = 1,
      shippingAddress,
      paymentMethod,
      couponCode,
      useCoins,
    } = req.body;

    /**
     * Validate quantity
     */
    const orderQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        orderQuantity
      ) ||
      orderQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    /**
     * Product
     */
    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    /**
     * Stock
     */
    if (
      product.stock <
      orderQuantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough stock available",
      });
    }

    /**
     * Manual payment
     */
    let manualPayment;

    try {
      manualPayment =
        buildManualPayment(
          paymentMethod,
          req.body
        );
    } catch (error) {
      return res.status(
        error.statusCode || 400
      ).json({
        success: false,
        message: error.message,
      });
    }

    /**
     * Price
     */
    const price =
      unitPrice(product);

    const subtotal =
      price * orderQuantity;

    /**
     * Calculate real totals
     */
    const totals =
      await computeTotals({
        subtotal,
        couponCode,
        district:
          shippingAddress?.district,
        user: req.user,
        useCoins,
      });

    const items = [
      {
        product:
          product._id,
        title:
          product.title,
        image:
          product.image,
        price,
        quantity:
          orderQuantity,
      },
    ];

    /**
     * Create order
     */
    const order =
      await Order.create({
        user: req.user._id,

        items,

        shippingAddress,

        subtotal,

        discount:
          totals.discount,

        coinsUsed:
          totals.coinsUsed,

        coinDiscount:
          totals.coinDiscount,

        shippingFee:
          totals.shippingFee,

        total:
          totals.total,

        paymentMethod,

        manualPayment,

        paymentStatus:
          "pending",

        couponCode:
          totals.coupon
            ? totals.coupon.code
            : null,

        source: "buy_now",
      });

    /**
     * Side effects
     */
    await applySideEffects(
      order,
      items,
      totals.coupon
    );

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get logged in user's orders
 * @route GET /api/orders
 */
export const getMyOrders = async (
  req,
  res,
  next
) => {
  try {
    const orders =
      await Order.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single order
 * @route GET /api/orders/:id
 */
export const getOrderById = async (
  req,
  res,
  next
) => {
  try {
    const order =
      await Order.findById(
        req.params.id
      ).populate(
        "user",
        "name email"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    if (
      order.user._id.toString() !==
        req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Cancel order
 * @route PUT /api/orders/:id/cancel
 */
export const cancelOrder = async (
  req,
  res,
  next
) => {
  try {
    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    if (
      order.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (
      order.orderStatus !==
      "pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending orders can be cancelled",
      });
    }

    order.orderStatus =
      "cancelled";

    await order.save();

    await restoreOrder(order);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all orders
 * @route GET /api/admin/orders
 */
export const getAllOrders = async (
  req,
  res,
  next
) => {
  try {
    const orders =
      await Order.find()
        .populate(
          "user",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update order status
 * @route PUT /api/admin/orders/:id
 */
export const updateOrderStatus =
  async (req, res, next) => {
    try {
      const {
        orderStatus,
        paymentStatus,
      } = req.body;

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      const previousStatus =
        order.orderStatus;

      const closedStatuses = [
        "cancelled",
        "returned",
      ];

      if (
        orderStatus &&
        orderStatus !== previousStatus
      ) {
        if (
          closedStatuses.includes(
            previousStatus
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Cancelled/returned orders can't be re-opened",
          });
        }

        order.orderStatus =
          orderStatus;

        if (
          closedStatuses.includes(
            orderStatus
          )
        ) {
          await restoreOrder(order);
        }

        if (
          orderStatus ===
          "delivered"
        ) {
          if (
            order.paymentMethod ===
            "cod"
          ) {
            order.paymentStatus =
              "paid";
          }

          if (
            !order.coinsAwarded
          ) {
            const settings =
              await getSettings();

            if (
              settings.coins.enabled
            ) {
              const base =
                order.subtotal -
                order.discount -
                order.coinDiscount;

              const earned =
                Math.max(
                  0,
                  Math.floor(
                    (base / 100) *
                      settings.coins
                        .earnPer100
                  )
                );

              order.coinsEarned =
                earned;

              if (earned > 0) {
                await User.findByIdAndUpdate(
                  order.user,
                  {
                    $inc: {
                      coins: earned,
                    },
                  }
                );
              }
            }

            order.coinsAwarded =
              true;
          }
        }
      }

      if (paymentStatus) {
        order.paymentStatus =
          paymentStatus;
      }

      await order.save();

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };