import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../services/productService.js";

// Soft Color Tints
const TINTS = [
  "bg-[#f5e3d7]", 
  "bg-[#d8d5f2]", 
  "bg-[#f2e2ce]", 
  "bg-[#fcd8e1]", 
  "bg-[#f3dbca]", 
  "bg-[#d2dbe5]"
];

export default function CategoryStrip() {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCats(Array.isArray(res) ? res : res.data || []))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  if (!cats.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Title and View All */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-extrabold text-[#0f1d35] tracking-tight">
          Shop by Category
        </h2>
        <Link
          to="/products"
          className="text-sm font-extrabold text-[#15532d] hover:underline flex items-center gap-1"
        >
          View all &rarr;
        </Link>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-5 justify-items-center">
        {cats.map((c, i) => {
          const bgColor = TINTS[i % TINTS.length];

          return (
            <Link
              key={c._id || i}
              to={`/products?category=${c._id || c.slug}`}
              className="group flex flex-col items-center text-center w-full max-w-[130px]"
            >
              {/* Circle Background Container (overflow-hidden নিশ্চিত করবে যেন ইমেজ গোল ফ্রেমের বাইরে না যায়) */}
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden flex items-center justify-center p-2 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-md ${bgColor}`}
              >
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Image link broke হলে fallback initial show করবে
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}

                {/* Fallback Initial Character */}
                <span 
                  className="text-3xl font-bold text-[#0f1d35] flex items-center justify-center"
                  style={{ display: c.image ? 'none' : 'flex' }}
                >
                  {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                </span>
              </div>

              {/* Title */}
              <span className="mt-3 text-xs sm:text-sm font-bold text-[#1e293b] group-hover:text-[#15532d] leading-snug line-clamp-2 transition-colors">
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}