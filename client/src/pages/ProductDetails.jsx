import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchProductById } from "../services/productService.js";
import { addToCartThunk } from "../redux/slices/cartSlice.js";
import { requireLogin } from "../utils/authGuard.js";

const DEFAULT_IMAGE = "https://www.herlan.com/wp-content/uploads/2023/12/1-768x768.webp";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    fetchProductById(id).then((res) => {
      setProduct(res.data);
      setActiveImage(res.data.image);
    });
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center font-bold text-slate-500">
        Loading...
      </div>
    );
  }

  const discountPercent = product.discount || 0;
  const finalPrice = product.price - (product.price * discountPercent) / 100;
  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);

  const handleAddToCart = () => {
    requireLogin(userInfo, navigate, `/products/${product.slug || product._id}`, () => {
      dispatch(addToCartThunk({ productId: product._id, quantity: qty }))
        .unwrap()
        .then(() => toast.success("Added to cart"))
        .catch((err) => toast.error(err?.message || "Could not add to cart"));
    });
  };

  const handleBuyNow = () => {
    requireLogin(userInfo, navigate, `/products/${product.slug || product._id}`, () =>
      navigate(`/buy-now/${product._id}`)
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Product Details Main Card */}
      <div className="bg-white rounded-[2.5rem] border border-[#15532d]/10 shadow-sm p-6 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* 1. Left Side: Image Gallery */}
        <div className="flex flex-col gap-4">
          {/* Main Active Image View */}
          <div className="relative aspect-square bg-[#f2f6f3] rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-100">
            {activeImage ? (
              <img
                src={activeImage || DEFAULT_IMAGE}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">
                No Image
              </div>
            )}

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md tracking-wide">
                -{discountPercent}%
              </span>
            )}

            {/* Out of Stock Overlay */}
            {product.stock === 0 && (
              <span className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center text-white text-sm font-bold uppercase tracking-wider">
                Out of Stock
              </span>
            )}
          </div>

          {/* Thumbnails Gallery */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImage === img
                      ? "border-[#15532d] scale-105 shadow-sm"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Right Side: Product Info */}
        <div className="flex flex-col justify-center space-y-5">
          {/* Category Tag */}
          {product.category && (
            <p className="text-xs font-extrabold tracking-widest text-[#15532d] uppercase">
              {product.category?.name || product.category}
            </p>
          )}

          {/* Product Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {product.title}
          </h1>

          {/* Price Tag with Accent Pill */}
          <div className="inline-flex items-baseline gap-2 self-start rounded-full bg-[#e8f2eb] px-4 py-1.5">
            <span className="text-2xl font-black text-[#15532d]">
              ৳{finalPrice.toFixed(0)}
            </span>
            {discountPercent > 0 && (
              <span className="text-sm text-slate-400 line-through font-semibold">
                ৳{product.price}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {product.description || "Premium quality product for daily use."}
          </p>

          {/* Stock Info */}
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Stock:{" "}
            <span className={product.stock > 0 ? "text-[#15532d]" : "text-red-500"}>
              {product.stock > 0 ? product.stock : "Out of stock"}
            </span>
          </p>

          {/* Action Area: Quantity Selector & Matching Hover Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            
            {/* Quantity Counter */}
            <div className="flex items-center border-2 border-slate-200 rounded-full overflow-hidden bg-slate-50">
              <button
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold transition"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="w-10 text-center font-bold text-slate-800 bg-transparent focus:outline-none text-sm"
              />
              <button
                onClick={() => setQty((prev) => prev + 1)}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 font-bold transition"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button (White -> Green Invert Animation) */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="relative overflow-hidden group/btn text-xs sm:text-sm font-semibold rounded-full border-2 border-[#15532d] text-[#15532d] px-6 py-2.5 transition-all duration-300 disabled:opacity-40"
            >
              <span className="absolute inset-0 bg-[#15532d] translate-x-[-101%] group-hover/btn:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 transition-colors duration-300 group-hover/btn:text-white">
                Add to Cart
              </span>
            </button>

            {/* Buy Now Button (Green -> White Invert Animation) */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="relative overflow-hidden group/btn text-xs sm:text-sm font-semibold rounded-full bg-[#15532d] border-2 border-[#15532d] text-white px-7 py-2.5 shadow-md transition-all duration-300 disabled:opacity-40"
            >
              <span className="absolute inset-0 bg-white translate-x-[-101%] group-hover/btn:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 inline-flex items-center justify-center gap-1.5 transition-colors duration-300 group-hover/btn:text-[#15532d]">
                <span>Buy Now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}