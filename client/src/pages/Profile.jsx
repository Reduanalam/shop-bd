import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { logout, updateProfileThunk } from "../redux/slices/authSlice.js";
import Icon from "../components/Icon.jsx";

const ORDER_STATUSES = [
  { key: "all", label: "All", icon: "cart" },
  { key: "pending", label: "Pending", icon: "clock" },
  { key: "confirmed", label: "Confirmed", icon: "shield" },
  { key: "processing", label: "Processing", icon: "refresh" },
  { key: "shipped", label: "Shipped", icon: "truck" },
  { key: "delivered", label: "Delivered", icon: "tag" },
  { key: "cancelled", label: "Cancelled", icon: "menu" },
];

const MENU = [
  { to: "/orders", label: "Track Orders", icon: "truck" },
  { to: "/wishlist", label: "My Wishlist", icon: "heart" },
  { to: "/cart", label: "My Cart", icon: "cart" },
];

export default function Profile() {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: userInfo?.name || "",
    phone: userInfo?.phone || "",
    street: userInfo?.address?.street || "",
    city: userInfo?.address?.city || "",
    district: userInfo?.address?.district || "",
  });
  const [saving, setSaving] = useState(false);

  const initial = (userInfo?.name || "?").trim().charAt(0).toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(
        updateProfileThunk({
          name: form.name,
          phone: form.phone,
          address: { street: form.street, city: form.city, district: form.district },
        })
      ).unwrap();
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-4">Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-wrap items-center gap-5">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-primary-100 text-primary-700 text-3xl font-bold shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-[180px]">
          <p className="text-lg font-bold">{userInfo?.name}</p>
          <p className="text-sm text-gray-500">{userInfo?.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="text-xs font-semibold rounded-lg ring-1 ring-black/10 px-3 py-1.5 hover:bg-primary-50"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
            {userInfo?.role === "admin" && (
              <Link to="/admin" className="text-xs font-semibold rounded-lg bg-primary-700 text-white px-3 py-1.5">
                Admin Panel
              </Link>
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-accent-500/10 text-accent-600 px-4 py-3 text-center shrink-0">
          <p className="text-2xl font-bold leading-none">{userInfo?.coins ?? 0}</p>
          <p className="text-[11px] font-semibold mt-1">My Coins</p>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 mt-4 grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Full name"
            className="border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Phone"
            className="border rounded-lg px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder="Street / house address"
            className="border rounded-lg px-3 py-2 sm:col-span-2"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
          />
          <input
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
          <button
            disabled={saving}
            className="sm:col-span-2 bg-primary-600 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-5 mt-4">
        <h2 className="font-semibold mb-3">My Orders</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {ORDER_STATUSES.map((s) => (
            <Link
              key={s.key}
              to={s.key === "all" ? "/orders" : `/orders?status=${s.key}`}
              className="flex flex-col items-center gap-1.5 rounded-xl py-3 hover:bg-primary-50 text-center"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-primary-600">
                <Icon name={s.icon} className="w-5 h-5" />
              </span>
              <span className="text-xs font-medium">{s.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm mt-4 divide-y">
        {MENU.map((m) => (
          <Link key={m.to} to={m.to} className="flex items-center justify-between px-5 py-3.5 hover:bg-primary-50">
            <span className="flex items-center gap-3 text-sm font-medium">
              <Icon name={m.icon} className="w-5 h-5 text-primary-600" /> {m.label}
            </span>
            <Icon name="arrow" className="w-4 h-4 text-gray-300" />
          </Link>
        ))}
        <button
          onClick={() => dispatch(logout())}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <Icon name="menu" className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );
}
