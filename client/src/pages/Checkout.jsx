import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { placeOrderApi } from "../services/orderService.js";
import PaymentMethodSelector from "../components/PaymentMethodSelector.jsx";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { items } = useSelector((state) => state.cart);

  // Selected products from cart
  const selectedIds =
    location.state?.selectedIds ||
    items.map((item) => item.product._id);

  const checkoutItems = items.filter((item) =>
    selectedIds.includes(item.product._id)
  );

  // ==============================
  // Shipping Form
  // ==============================

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    postalCode: "",
  });

  // ==============================
  // Payment
  // ==============================

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [manualPayment, setManualPayment] = useState({
    senderNumber: "",
    transactionId: "",
  });

  const [loading, setLoading] = useState(false);

  // ==============================
  // Promo / Spin Code
  // ==============================

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  // ==============================
  // Delivery Charge
  // ==============================

  const shippingFee = 60;

  // ==============================
  // Calculate Subtotal
  // ==============================

  const subtotal = checkoutItems.reduce((sum, item) => {
    const price =
      item.product.price -
      (item.product.price * (item.product.discount || 0)) / 100;

    return sum + price * item.quantity;
  }, 0);

  // ==============================
  // Calculate Grand Total
  // ==============================

  const grandTotal = Math.max(
    0,
    subtotal + shippingFee - discountAmount
  );

  // ==============================
  // Apply Coupon
  // ==============================

  const handleApplyCoupon = (e) => {
    e.preventDefault();

    if (!couponInput.trim()) {
      toast.error("Please enter a promo or spin code");
      return;
    }

    const code = couponInput.trim().toUpperCase();

    // Demo coupon validation
    if (code.startsWith("SPIN") || code === "PROMO100") {
      const discount = 100;

      setDiscountAmount(discount);
      setAppliedCoupon(code);

      toast.success("Coupon code applied successfully!");
    } else {
      setDiscountAmount(0);
      setAppliedCoupon("");

      toast.error("Invalid coupon code!");
    }
  };

  // ==============================
  // Remove Coupon
  // ==============================

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setDiscountAmount(0);
    setCouponInput("");

    toast.info("Coupon removed");
  };

  // ==============================
  // Place Order
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (checkoutItems.length === 0) {
      toast.error("No items selected for checkout");
      return;
    }

    setLoading(true);

    try {
      const res = await placeOrderApi({
        shippingAddress: form,
        paymentMethod,

        manualPayment:
          paymentMethod !== "cod"
            ? manualPayment
            : undefined,

        selectedItems: selectedIds,

        // Promo / Spin Code
        couponCode: appliedCoupon || undefined,
        discount: discountAmount,
      });

      toast.success("Order placed successfully!");

      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ==============================
          Page Title
      ============================== */}

      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Checkout
      </h1>

      {/* ==============================
          Selected Products
      ============================== */}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 space-y-2">
        {checkoutItems.map((item) => {
          const price =
            item.product.price -
            (item.product.price *
              (item.product.discount || 0)) /
              100;

          return (
            <div
              key={item.product._id}
              className="flex justify-between text-sm"
            >
              <span>
                {item.product.title} × {item.quantity}
              </span>

              <span>
                ৳{(price * item.quantity).toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* ==============================
          Checkout Form
      ============================== */}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
      >
        {/* ==============================
            Shipping Address
        ============================== */}

        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
            Shipping Address
          </h2>

          <div className="space-y-3">
            {/* Name + Phone */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                type="text"
                placeholder="Full Name"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <input
                required
                type="tel"
                placeholder="Phone Number"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            {/* Street Address */}

            <input
              required
              type="text"
              placeholder="Street Address"
              className="border border-gray-300 rounded-lg px-3.5 py-2.5 w-full focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
              value={form.street}
              onChange={(e) =>
                setForm({
                  ...form,
                  street: e.target.value,
                })
              }
            />

            {/* City + District + Postal Code */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                required
                type="text"
                placeholder="City"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="District"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.district}
                onChange={(e) =>
                  setForm({
                    ...form,
                    district: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Postal Code"
                className="border border-gray-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm"
                value={form.postalCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    postalCode: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* ==============================
            Promo / Spin Code
        ============================== */}

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
                onChange={(e) =>
                  setCouponInput(e.target.value)
                }
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

                <span className="text-sm font-medium text-emerald-700">
                  -৳{discountAmount} Off Applied
                </span>
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

        {/* ==============================
            Payment Method
        ============================== */}

        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
            Payment Method
          </h2>

          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            manualPayment={manualPayment}
            setManualPayment={setManualPayment}
          />
        </div>

        {/* ==============================
            Price Summary
        ============================== */}

        <div className="pt-4 border-t space-y-2">
          {/* Subtotal */}

          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>৳{subtotal.toFixed(0)}</span>
          </div>

          {/* Delivery */}

          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery Charge</span>
            <span>৳{shippingFee}</span>
          </div>

          {/* Discount */}

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 font-medium">
              <span>Spin / Promo Discount</span>
              <span>-৳{discountAmount}</span>
            </div>
          )}

          {/* Total */}

          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">
                Total Payable
              </p>

              <p className="font-bold text-2xl text-gray-900">
                ৳{grandTotal.toFixed(0)}
              </p>
            </div>

            <button
              type="submit"
              disabled={
                loading || checkoutItems.length === 0
              }
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading
                ? "Placing order..."
                : "Place Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
