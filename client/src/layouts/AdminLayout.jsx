import { Link, Outlet, useLocation } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/banners", label: "Homepage Slider" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-gray-900 text-gray-200 p-4 hidden md:block">
        <h2 className="text-white font-bold text-lg mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm ${
                location.pathname === link.to ? "bg-primary-600 text-white" : "hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/" className="px-3 py-2 rounded-lg text-sm hover:bg-gray-800 mt-4">
            ← Back to site
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
