import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchCartThunk,
  updateCartItemThunk,
  removeCartItemThunk,
} from "../redux/slices/cartSlice.js";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (userInfo) dispatch(fetchCartThunk());
  }, [dispatch, userInfo]);

  // Keep selection in sync as items load / change (default: everything selected)
  useEffect(() => {
    setSelected((prev) => {
      const validIds = items.map((i) => i.product._id);
      const kept = prev.filter((id) => validIds.includes(id));
      const newIds = validIds.filter((id) => !prev.includes(id));
      return [...kept, ...newIds];
    });
  }, [items]);

  const allSelected = items.length > 0 && selected.length === items.length;

  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : items.map((i) => i.product._id));
  };

  const toggleSelect = (productId) => {
    setSelected((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const selectedItems = items.filter((i) => selected.includes(i.product._id));

  const subtotal = selectedItems.reduce((sum, item) => {
    const price = item.product.price - (item.product.price * item.product.discount) / 100;
    return sum + price * item.quantity;
  }, 0);

  const changeQuantity = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (newQty > item.product.stock) {
      toast.error("Not enough stock available");
      return;
    }
    dispatch(updateCartItemThunk({ productId: item.product._id, quantity: newQty }));
  };

  const handleCheckout = () => {
    if (selected.length === 0) {
      toast.error("Select at least one product to checkout");
      return;
    }
    navigate("/checkout", { state: { selectedIds: selected } });
  };

  if (!userInfo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="mb-4">Cart দেখতে হলে আগে লগইন করুন।</p>
        <Link to="/login?redirect=/cart" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg">
          Login
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="max-w-3xl mx-auto px-4 py-16 text-center">আপনার কার্ট খালি।</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Shopping Cart</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4" />
          Select all
        </label>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => {
          const price = item.product.price - (item.product.price * item.product.discount) / 100;
          const isSelected = selected.includes(item.product._id);
          return (
            <div
              key={item.product._id}
              className={`flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm ${
                isSelected ? "" : "opacity-60"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(item.product._id)}
                className="w-4 h-4 flex-shrink-0"
              />
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.product.image && (
                  <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.product.title}</h3>
                <p className="text-primary-600 font-bold">৳{price.toFixed(0)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeQuantity(item, -1)}
                  className="w-8 h-8 border rounded-lg"
                >
                  −
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => changeQuantity(item, 1)}
                  className="w-8 h-8 border rounded-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => dispatch(removeCartItemThunk(item.product._id))}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
        <span className="font-bold text-lg">
          Subtotal ({selectedItems.length} selected): ৳{subtotal.toFixed(0)}
        </span>
        <button
          onClick={handleCheckout}
          disabled={selected.length === 0}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
