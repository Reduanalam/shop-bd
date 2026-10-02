import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCartThunk } from "../redux/slices/cartSlice.js";
import { requireLogin } from "../utils/authGuard.js";

const DEFAULT_IMAGE = "https://www.herlan.com/wp-content/uploads/2023/12/1-768x768.webp";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const discountPercent = product.discount || 0;
  const finalPrice = product.price - (product.price * discountPercent) / 100;
  const link = `/products/${product.slug || product._id}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    requireLogin(userInfo, navigate, link, () => {
      dispatch(addToCartThunk({ productId: product._id, quantity: 1 }))
        .unwrap()
        .then(() => toast.success("Added to cart"))
        .catch((err) => toast.error(err?.message || "Could not add to cart"));
    });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    requireLogin(userInfo, navigate, link, () => navigate(`/buy-now/${product._id}`));
  };

  return (
    <Link
      to={link}
      className="group relative bg-white rounded-[2rem] border border-[#15532d]/10 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 p-3.5 flex flex-col justify-between overflow-hidden"
    >
      {/* 1. Image Container with Badges */}
      <div className="relative aspect-square bg-[#f2f6f3] rounded-[1.5rem] overflow-hidden mb-3">
        <img
          src={product.image || DEFAULT_IMAGE}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md tracking-wide">
            -{discountPercent}%
          </span>
        )}

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <span className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
            Out of Stock
          </span>
        )}
      </div>

      {/* 2. Content Info */}
      <div className="flex-1 flex flex-col justify-between px-1">
        <div>
          {/* Category Tag */}
          {product.category && (
            <p className="text-[11px] font-extrabold tracking-widest text-[#15532d] uppercase mb-1">
              {product.category?.name || product.category}
            </p>
          )}

          {/* Product Title */}
          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#15532d] transition-colors leading-snug">
            {product.title}
          </h3>

          {/* 1-Line Description */}
          <p className="mt-1 text-xs text-slate-500 line-clamp-1 leading-relaxed">
            {product.description || product.subtitle || "Premium quality product for daily use."}
          </p>
        </div>

        {/* Price Tag with Soft Light Green Accent */}
        <div className="mt-3 inline-flex items-baseline gap-1.5 self-start rounded-full bg-[#e8f2eb] px-3.5 py-1">
          <span className="text-sm font-extrabold text-[#15532d]">
            ৳{finalPrice.toFixed(0)}
          </span>
          {discountPercent > 0 && (
            <span className="text-[11px] text-slate-400 line-through font-medium">
              ৳{product.price}
            </span>
          )}
        </div>
      </div>

      {/* 3. Action Buttons with Invert Color Animation */}
      <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        
        {/* Add to Cart: White Bg -> Left to Right Green Fill (#15532d) */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="relative overflow-hidden group/btn text-xs font-semibold rounded-full border-2 border-[#15532d] text-[#15532d] py-2 transition-all duration-300 disabled:opacity-40"
        >
          <span className="absolute inset-0 bg-[#15532d] translate-x-[-101%] group-hover/btn:translate-x-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 transition-colors duration-300 group-hover/btn:text-white">
            Add to Cart
          </span>
        </button>

        {/* Buy Now: Green Bg -> Left to Right White Fill */}
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="relative overflow-hidden group/btn text-xs font-semibold rounded-full bg-[#15532d] border-2 border-[#15532d] text-white py-2 shadow-sm transition-all duration-300 disabled:opacity-40"
        >
          <span className="absolute inset-0 bg-white translate-x-[-101%] group-hover/btn:translate-x-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 inline-flex items-center justify-center gap-1 transition-colors duration-300 group-hover/btn:text-[#15532d]">
            <span>Buy Now</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </button>

      </div>
    </Link>
  );
}