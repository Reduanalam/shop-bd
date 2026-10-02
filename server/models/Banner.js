import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // use \n for a line break
    highlight: { type: String, default: "", trim: true }, // last line, shown in brand green
    subtitle: { type: String, default: "" },
    tag: { type: String, default: "" }, // small handwritten label above the image
    image: { type: String, required: true },
    link: { type: String, default: "/products" },
    buttonText: { type: String, default: "Shop Now" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
