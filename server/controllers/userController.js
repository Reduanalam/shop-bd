import User from "../models/User.js";

// @desc Get all users (admin)
// @route GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc Update a user's role/status (admin)
// @route PUT /api/admin/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a user (admin)
// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};
