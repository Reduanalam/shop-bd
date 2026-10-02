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

  // Cart page passes which product IDs were checked; if not provided, checkout everything
  const selectedIds = location.state?.selectedIds || items.map((i) => i.product._id);
  const checkoutItems = items.filter((i) => selectedIds.includes(i.product._id));

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

  const subtotal = checkoutItems.reduce((sum, item) => {
    const price = item.product.price - (item.product.price * item.product.discount) / 100;
    return sum + price * item.quantity;
  }, 0);

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
        manualPayment: paymentMethod !== "cod" ? manualPayment : undefined,
        selectedItems: selectedIds,
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
      <h1 className="text-xl font-bold mb-6">Checkout</h1>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 space-y-2">
        {checkoutItems.map((item) => {
          const price = item.product.price - (item.product.price * item.product.discount) / 100;
          return (
            <div key={item.product._id} className="flex justify-between text-sm">
              <span>{item.product.title} × {item.quantity}</span>
              <span>৳{(price * item.quantity).toFixed(0)}</span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="Full Name"
            className="border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            placeholder="Phone"
            className="border rounded-lg px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <input
          required
          placeholder="Street Address"
          className="border rounded-lg px-3 py-2 w-full"
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-4">
          <input
            required
            placeholder="City"
            className="border rounded-lg px-3 py-2"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            placeholder="District"
            className="border rounded-lg px-3 py-2"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
          />
          <input
            placeholder="Postal Code"
            className="border rounded-lg px-3 py-2"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          />
        </div>

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          manualPayment={manualPayment}
          setManualPayment={setManualPayment}
        />

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="font-bold text-lg">Subtotal: ৳{subtotal.toFixed(0)}</span>
          <button
            type="submit"
            disabled={loading || checkoutItems.length === 0}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Placing order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
