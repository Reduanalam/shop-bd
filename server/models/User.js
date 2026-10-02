import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["customer", "admin", "seller"], default: "customer" },
    address: {
      street: String,
      city: String,
      district: String,
      postalCode: String,
      country: { type: String, default: "Bangladesh" },
    },
    image: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    coins: { type: Number, default: 0, min: 0 },
    lastSpinAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
