import { useEffect, useState } from "react";
import { adminFetchOrders, adminUpdateOrderStatus } from "../../services/adminService.js";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const load = () => adminFetchOrders().then((res) => setOrders(res.data));

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id, orderStatus) => {
    await adminUpdateOrderStatus(id, { orderStatus });
    load();
  };

  const handlePaymentStatusChange = async (id, paymentStatus) => {
    await adminUpdateOrderStatus(id, { paymentStatus });
    load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Manage Orders</h1>
      <div className="bg-white rounded-xl shadow-sm divide-y">
        {orders.map((order) => {
          const isOpen = expandedId === order._id;
          return (
            <div key={order._id}>
              <button
                onClick={() => setExpandedId(isOpen ? null : order._id)}
                className="w-full p-4 flex justify-between items-center text-left"
              >
                <div>
                  <p className="font-medium">
                    #{order._id.slice(-8)} — {order.user?.name}
                    {order.source === "buy_now" && (
                      <span className="ml-2 text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                        Buy Now
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    ৳{order.total.toFixed(0)} ·{" "}
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()} (
                    {order.paymentStatus}) · {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="border rounded-lg px-2 py-1 text-sm capitalize"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="bg-gray-50 rounded-xl p-4 grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold mb-2">Customer</p>
                      <p>{order.user?.name}</p>
                      <p className="text-gray-500">{order.user?.email}</p>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Shipping address</p>
                      <p>{order.shippingAddress?.name} · {order.shippingAddress?.phone}</p>
                      <p className="text-gray-500">
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}
                        {order.shippingAddress?.district ? `, ${order.shippingAddress.district}` : ""}
                        {order.shippingAddress?.postalCode ? ` - ${order.shippingAddress.postalCode}` : ""}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Payment</p>
                      <p>{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()}</p>

                      {order.manualPayment?.transactionId && (
                        <div className="mt-1 bg-white border rounded-lg p-2 text-xs space-y-0.5">
                          <p><span className="text-gray-500">Merchant number:</span> {order.manualPayment.receiverNumber}</p>
                          <p><span className="text-gray-500">Customer sent from:</span> {order.manualPayment.senderNumber}</p>
                          <p><span className="text-gray-500">Transaction ID:</span> {order.manualPayment.transactionId}</p>
                          <p className="text-gray-400">⚠️ Verify this TXN ID in your {order.manualPayment.provider} app before marking as paid</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-500">Status:</span>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                          className="border rounded-lg px-2 py-1 text-xs capitalize"
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Order totals</p>
                      <p className="text-gray-500">Subtotal: ৳{order.subtotal.toFixed(0)}</p>
                      <p className="text-gray-500">Discount: ৳{order.discount.toFixed(0)}</p>
                      <p className="text-gray-500">Shipping: ৳{order.shippingFee.toFixed(0)}</p>
                      <p className="font-medium">Total: ৳{order.total.toFixed(0)}</p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="font-semibold mb-2">Items</p>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-gray-600">
                            <span>{item.title} × {item.quantity}</span>
                            <span>৳{(item.price * item.quantity).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
