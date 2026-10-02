import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOrderById } from "../services/orderService.js";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrderById(id).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <p className="max-w-3xl mx-auto px-4 py-8">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Order #{order._id.slice(-8)}</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <p className="mb-1"><span className="font-medium">Status:</span> {order.orderStatus}</p>
        <p className="mb-1">
          <span className="font-medium">Payment:</span>{" "}
          {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()} ({order.paymentStatus})
        </p>
        {order.manualPayment?.transactionId && (
          <p className="mb-1 text-sm text-gray-500">
            Transaction ID: {order.manualPayment.transactionId} — admin will verify and confirm shortly
          </p>
        )}
        <p><span className="font-medium">Shipping to:</span> {order.shippingAddress?.name}, {order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-2 border-b last:border-0">
            <span>{item.title} × {item.quantity}</span>
            <span>৳{(item.price * item.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 font-bold">
          <span>Total</span>
          <span>৳{order.total.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
