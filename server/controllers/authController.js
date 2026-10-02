import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc Register new user
// @route POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, phone });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        token: generateToken(user._id, user.role),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get logged in user profile
// @route GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

// @desc Update profile
// @route PUT /api/auth/me
export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, address, image } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (image) user.image = image;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
