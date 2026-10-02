import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { toast } from "react-toastify";
import { uploadProductImage } from "../../services/adminService.js";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => api.get("/categories").then((res) => setCategories(res.data.data || res.data));

  useEffect(() => {
    load();
  }, []);

  // Computer theke file upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadProductImage(file);
      setImage(res.data.url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingId(category._id);
    setName(category.name || "");
    setImage(category.image || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setImage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, { name, image });
        toast.success("Category updated successfully");
      } else {
        await api.post("/admin/categories", { name, image });
        toast.success("Category added successfully");
      }
      handleCancel();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success("Category deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">
        {editingId ? "Edit Category" : "Manage Categories"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            required
            placeholder="Category name *"
            className="border rounded-lg px-3 py-2 flex-1 outline-none focus:ring-2 focus:ring-primary-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Image URL (Optional)"
            className="border rounded-lg px-3 py-2 flex-1 outline-none focus:ring-2 focus:ring-primary-500"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        {/* File Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs text-gray-500 mb-1">
              Or upload image from device:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="border rounded-lg px-3 py-1.5 w-full text-sm outline-none"
            />
            {uploading && <p className="text-xs text-gray-400 mt-1">Uploading image…</p>}
          </div>

          {image && (
            <img
              src={image}
              alt="Preview"
              className="w-12 h-12 object-cover rounded-md border flex-shrink-0"
            />
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {editingId ? "Update Category" : "Add Category"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {categories.map((c) => (
          <div key={c._id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-12 h-12 object-cover rounded-md border"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}
              <span className="font-medium text-gray-800">{c.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEditClick(c)}
                className="text-amber-600 hover:text-amber-800 text-sm font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No categories found. Add one above.
          </div>
        )}
      </div>
    </div>
  );
}