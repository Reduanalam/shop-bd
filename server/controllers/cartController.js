import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc Get logged in user's cart
// @route GET /api/cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc Add item to cart
// @route POST /api/cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product");
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc Update item quantity
// @route PUT /api/cart/:productId
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not in cart" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc Remove item from cart
// @route DELETE /api/cart/:productId
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate("items.product");
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc Clear cart
// @route DELETE /api/cart
export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};
