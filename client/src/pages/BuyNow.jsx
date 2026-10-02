import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchProductById } from "../services/productService.js";
import { placeDirectOrderApi } from "../services/orderService.js";
import PaymentMethodSelector from "../components/PaymentMethodSelector.jsx";

export default function BuyNow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [manualPayment, setManualPayment] = useState({ senderNumber: "", transactionId: "" });
  const [loading, setLoading] = useState(false);

  // Coupon / Spin Code States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const shippingFee = 60;

  useEffect(() => {
    fetchProductById(id).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <p className="max-w-3xl mx-auto px-4 py-8">Loading...</p>;

  const finalPrice = product.price - (product.price * (product.discount || 0)) / 100;
  const subtotal = finalPrice * quantity;
  const grandTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  // Spin/Coupon Apply Handler
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    // TODO: আপনার backend API থাকলে এখানে সার্ভিস কল করতে পারেন (e.g. verifyCoupon(couponInput))
    // উদাহরণ ডেমো ভ্যালিডেশন:
    if (couponInput.toUpperCase().startsWith("SPIN") || couponInput.toUpperCase() === "PROMO100") {
      const discount = 100; // আপনার লজিক অনুযায়ী ডিসকাউন্ট টাকার পরিমাণ নির্ধারণ করুন
      setDiscountAmount(discount);
      setAppliedCoupon(couponInput.toUpperCase());
      toast.success("Coupon code applied successfully!");
    } else {
      toast.error("Invalid coupon code!");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setDiscountAmount(0);
    setCouponInput("");
    toast.info("Coupon removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await placeDirectOrderApi({
        productId: product._id,
        quantity,
        shippingAddress: form,
        paymentMethod,
        manualPayment: paymentMethod !== "cod" ? manualPayment : undefined,
        couponCode: appliedCoupon || undefined,
        discount: discountAmount,
      });
      toast.success("Order placed successfully!");
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Checkout / Buy Now</h1>

      {/* Product Summary Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
          {product.image && <img src={product.image} alt={product.title} className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{product.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary-600 font-bold text-lg">৳{finalPrice.toFixed(0)}</span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">৳{product.price}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-8 h-8 border rounded-md bg-white hover:bg-gray-100 font-bold text-gray-600 transition"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="w-8 h-8 border rounded-md bg-white hover:bg-gray-100 font-bold text-gray-600 transition"
          >
            +
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        {/* Shipping Form Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Shipping Address</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                placeholder="Full Name"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required
                placeholder="Phone Number"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <input
              required
              placeholder="Street Address"
              className="border border-gray-300 rounded-lg px-3.5 py-2.5 w-full focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                required
                placeholder="City"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                placeholder="District"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
              <input
                placeholder="Postal Code"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Spin / Coupon Code Section */}
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
          <label className="block text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
            Have a Spin Code or Promo Coupon?
          </label>
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Spin / Promo Code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 border border-emerald-300 rounded-lg px-3.5 py-2 text-sm uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
              >
                Apply
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-emerald-300 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                  {appliedCoupon}
                </span>
                <span className="text-sm font-medium text-emerald-700">-৳{discountAmount} Off Applied</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs font-semibold text-red-500 hover:text-red-700 underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Payment Method Selector */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Payment Method</h2>
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            manualPayment={manualPayment}
            setManualPayment={setManualPayment}
          />
        </div>

        {/* Price Breakdown & Action */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>৳{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery Charge</span>
            <span>৳{shippingFee}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 font-medium">
              <span>Spin / Promo Discount</span>
              <span>-৳{discountAmount}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Total Payable</p>
              <p className="font-bold text-2xl text-gray-900">৳{grandTotal.toFixed(0)}</p>
            </div>
            <button
              type="submit"
              disabled={loading || product.stock === 0}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Placing order..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}