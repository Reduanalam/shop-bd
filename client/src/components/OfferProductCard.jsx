import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCartThunk } from "../redux/slices/cartSlice.js";
import { requireLogin } from "../utils/authGuard.js";

const DEFAULT_IMAGE = "https://www.herlan.com/wp-content/uploads/2023/12/1-768x768.webp";

// Flash-sale style card: discount ribbon + price + a sold/left progress bar,
// matching the "Deals you can't miss" look from the reference screenshot.
export default function OfferProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const finalPrice = product.price - (product.price * product.discount) / 100;
  const link = `/products/${product.slug || product._id}`;

  const capacity = Math.max(product.sold + product.stock, 1);
  const soldPercent = Math.min(100, Math.round((product.sold / capacity) * 100));
  const lowStock = product.stock > 0 && product.stock <= 10;

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

  return (
    <Link to={link} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        <img src={product.image || DEFAULT_IMAGE} alt={product.title} className="w-full h-full object-cover" />
        {product.discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-accent-500 px-2 py-0.5 text-xs font-bold text-white">
            -{product.discount}%
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5em]">{product.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-bold text-primary-600">৳{finalPrice.toFixed(0)}</span>
          {product.discount > 0 && <span className="text-xs text-gray-400 line-through">৳{product.price}</span>}
        </div>

        <div className="mt-2">
          <div className="h-1.5 w-full rounded-full bg-primary-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${lowStock ? "bg-accent-500" : "bg-primary-500"}`}
              style={{ width: `${Math.max(soldPercent, 6)}%` }}
            />
          </div>
          <p className={`mt-1 text-[11px] font-medium ${lowStock ? "text-accent-600" : "text-gray-500"}`}>
            {lowStock ? `Only ${product.stock} items left` : `${product.sold} items sold`}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-3 text-xs font-semibold bg-primary-600 text-white rounded-lg py-1.5 disabled:opacity-40"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
