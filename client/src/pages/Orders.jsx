import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchMyOrders } from "../services/orderService.js";

const STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "all";

  useEffect(() => {
    fetchMyOrders().then((res) => setOrders(res.data));
  }, []);

  const filtered = status === "all" ? orders : orders.filter((o) => o.orderStatus === status);

  const setStatus = (s) => {
    if (s === "all") setSearchParams({});
    else setSearchParams({ status: s });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-4">My Orders</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`capitalize rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              status === s ? "bg-primary-600 text-white" : "bg-white text-gray-600 ring-1 ring-black/10 hover:bg-primary-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>কোনো অর্ডার পাওয়া যায়নি।</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between">
                <span className="font-medium">Order #{order._id.slice(-8)}</span>
                <span className="capitalize text-sm bg-gray-100 px-2 py-1 rounded">{order.orderStatus}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {order.items.length} items · ৳{order.total.toFixed(0)} · {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
