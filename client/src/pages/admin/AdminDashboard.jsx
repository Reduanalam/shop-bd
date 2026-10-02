import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../../services/adminService.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats().then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Loading...</p>;

  const cards = [
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Total Products", value: stats.totalProducts },
    { label: "Total Customers", value: stats.totalUsers },
    { label: "Total Revenue", value: `৳${stats.totalRevenue.toFixed(0)}` },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold mb-3">Recent Orders</h2>
      <div className="bg-white rounded-xl shadow-sm divide-y">
        {stats.recentOrders.map((order) => (
          <div key={order._id} className="p-4 flex justify-between text-sm">
            <span>#{order._id.slice(-8)} — {order.user?.name}</span>
            <span className="capitalize">{order.orderStatus}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
