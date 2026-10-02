import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminFetchCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from "../../services/adminService.js";

const EMPTY = { code: "", discountPercent: "", flatAmount: "", expiryDate: "", minOrderAmount: "", isPublic: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY);

  const load = () => adminFetchCoupons().then((res) => setCoupons(res.data));
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminCreateCoupon({
        ...form,
        discountPercent: Number(form.discountPercent) || 0,
        flatAmount: Number(form.flatAmount) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
      });
      toast.success("Coupon created");
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    }
  };

  const toggleActive = async (c) => {
    await adminUpdateCoupon(c._id, { isActive: !c.isActive });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    await adminDeleteCoupon(id);
    load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Manage Coupons</h1>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl shadow-sm mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <input required placeholder="Code (e.g. SAVE10)" className="border rounded-lg px-3 py-2 uppercase"
          value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <input type="number" placeholder="Discount %" className="border rounded-lg px-3 py-2"
          value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
        <input type="number" placeholder="Flat amount ৳" className="border rounded-lg px-3 py-2"
          value={form.flatAmount} onChange={(e) => setForm({ ...form, flatAmount: e.target.value })} />
        <input type="number" placeholder="Min order ৳" className="border rounded-lg px-3 py-2"
          value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
        <input required type="date" className="border rounded-lg px-3 py-2"
          value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
          Public (visible to all customers)
        </label>
        <button className="bg-primary-600 text-white py-2 rounded-lg font-semibold col-span-2 sm:col-span-3">Add Coupon</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {coupons.map((c) => (
          <div key={c._id} className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[160px]">
              <p className="font-bold">{c.code} {c.source === "spin" && <span className="text-xs text-accent-600">(spin win)</span>}</p>
              <p className="text-sm text-gray-500">
                {c.discountPercent > 0 && `${c.discountPercent}% off `}
                {c.flatAmount > 0 && `৳${c.flatAmount} off `}
                · min ৳{c.minOrderAmount} · expires {new Date(c.expiryDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => toggleActive(c)}
              className={`text-xs font-semibold rounded-full px-3 py-1 ${c.isActive ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"}`}
            >
              {c.isActive ? "Active" : "Inactive"}
            </button>
            <button onClick={() => remove(c._id)} className="text-red-500 text-sm">Delete</button>
          </div>
        ))}
        {coupons.length === 0 && <p className="p-4 text-gray-400">No coupons yet.</p>}
      </div>
    </div>
  );
}
