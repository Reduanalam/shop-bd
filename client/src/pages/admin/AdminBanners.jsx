import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  adminFetchBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  uploadProductImage,
} from "../../services/adminService.js";

const EMPTY = { 
  title: "", 
  highlight: "", 
  subtitle: "", 
  tag: "", 
  image: "", 
  link: "/products", 
  buttonText: "Shop Now", 
  order: 0 
};

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null); // Edit state tracking
  const [uploading, setUploading] = useState(false);

  const load = () => adminFetchBanners().then((res) => setBanners(res.data));
  useEffect(() => {
    load();
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadProductImage(file);
      setForm((f) => ({ ...f, image: res.data.url }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Edit বাটনে ক্লিক করলে ফর্ম ফিলআপ করার ফাংশন
  const handleEditClick = (b) => {
    setEditingId(b._id);
    setForm({
      title: b.title || "",
      highlight: b.highlight || "",
      subtitle: b.subtitle || "",
      tag: b.tag || b.smallTag || "",
      image: b.image || "",
      link: b.link || "/products",
      buttonText: b.buttonText || "Shop Now",
      order: b.order || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  // Create অথবা Update দুটিই এক হ্যান্ডলারে
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      toast.error("Please upload a banner image");
      return;
    }
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editingId) {
        await adminUpdateBanner(editingId, payload);
        toast.success("Banner updated successfully");
      } else {
        await adminCreateBanner(payload);
        toast.success("Banner added — it will appear in the homepage slider");
      }
      handleCancel();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const toggleActive = async (b) => {
    await adminUpdateBanner(b._id, { isActive: !b.isActive });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this banner?")) return;
    await adminDeleteBanner(id);
    load();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">
        {editingId ? "Edit Banner" : "Manage Homepage Slider"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        These banners power the hero slider on the homepage. Use \n in the title for a line break.
      </p>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm mb-6 grid grid-cols-2 gap-3">
        <textarea required placeholder="Title (use \n for line breaks)" className="border rounded-lg px-3 py-2 col-span-2"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Highlight line (shown in green)" className="border rounded-lg px-3 py-2"
          value={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.value })} />
        <input placeholder="Small tag text" className="border rounded-lg px-3 py-2"
          value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
        <input placeholder="Subtitle" className="border rounded-lg px-3 py-2 col-span-2"
          value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <input placeholder="Button link (e.g. /products?category=..)" className="border rounded-lg px-3 py-2"
          value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        <input placeholder="Button text" className="border rounded-lg px-3 py-2"
          value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
        <input type="number" placeholder="Display order" className="border rounded-lg px-3 py-2 col-span-2"
          value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">Banner Image (wide, ~4:3)</label>
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="border rounded-lg px-3 py-2 w-full text-sm" />
          {uploading && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
          {form.image && <img src={form.image} alt="" className="mt-3 w-32 h-24 object-cover rounded-lg border" />}
        </div>

        <div className="col-span-2 flex gap-2">
          <button disabled={uploading} className="bg-primary-600 text-white py-2 rounded-lg font-semibold flex-1 disabled:opacity-50">
            {editingId ? "Update Banner" : "Add Banner"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {banners.map((b) => (
          <div key={b._id} className="p-4 flex flex-wrap items-center gap-3">
            <img src={b.image} alt="" className="w-20 h-14 object-cover rounded-lg border flex-shrink-0" />
            <div className="flex-1 min-w-[160px]">
              <p className="font-medium whitespace-pre-line">{b.title}</p>
              <p className="text-sm text-gray-500">order {b.order}</p>
            </div>
            <button
              onClick={() => toggleActive(b)}
              className={`text-xs font-semibold rounded-full px-3 py-1 ${b.isActive ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"}`}
            >
              {b.isActive ? "Active" : "Inactive"}
            </button>
            {/* Edit Button */}
            <button onClick={() => handleEditClick(b)} className="text-amber-600 font-medium text-sm">
              Edit
            </button>
            <button onClick={() => remove(b._id)} className="text-red-500 text-sm">
              Delete
            </button>
          </div>
        ))}
        {banners.length === 0 && <p className="p-4 text-gray-400">No banners yet — the homepage falls back to default slides.</p>}
      </div>
    </div>
  );
}