import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";
import slugify from "slugify";

const run = async () => {
  await connectDB();

  await User.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();

  const admin = await User.create({
    name: "Admin",
    email: "admin@shopbd.com",
    password: "admin123",
    role: "admin",
  });

  const categories = await Category.insertMany([
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion", slug: "fashion" },
    { name: "Home & Living", slug: "home-living" },
  ]);

  const sampleProducts = [
    { title: "Wireless Headphones", price: 2500, stock: 50, category: categories[0]._id, description: "High quality wireless headphones with noise cancellation." },
    { title: "Smart Watch", price: 3500, discount: 10, stock: 30, category: categories[0]._id, description: "Feature-packed smart watch with heart rate monitor." },
    { title: "Men's Casual Shirt", price: 800, stock: 100, category: categories[1]._id, description: "Comfortable cotton casual shirt for everyday wear." },
    { title: "Table Lamp", price: 1200, stock: 40, category: categories[2]._id, description: "Elegant modern table lamp for your living room." },
  ];

  for (const p of sampleProducts) {
    await Product.create({ ...p, slug: slugify(p.title, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-4) });
  }

  console.log("Seed complete. Admin login: admin@shopbd.com / admin123");
  process.exit();
};

run();
