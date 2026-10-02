import { useEffect, useState } from "react";
import { fetchProducts, fetchCategories } from "../../services/productService.js";
import { 
  adminCreateProduct, 
  adminUpdateProduct, 
  adminDeleteProduct, 
  uploadProductImage, 
  uploadProductGalleryImages 
} from "../../services/adminService.js";
import { toast } from "react-toastify";

const initialForm = {
  title: "",
  price: "",
  stock: "",
  discount: "",
  description: "",
  image: "",
  gallery: [],
  category: "",
  isTrending: false,
  flashSale: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null); // Full Edit Mode Track korbe
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const load = () => fetchProducts({ limit: 50 }).then((res) => setProducts(res.data));

  useEffect(() => {
    load();
    fetchCategories().then((res) => setCategories(res.data));
  }, []);

  // Image File Upload Handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadProductImage(file);
      setForm((f) => ({ ...f, image: res.data.url }));
      toast.success("Main image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Gallery Upload Handler
  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.some((f) => f.size > 5 * 1024 * 1024)) {
      toast.error("Each image must be under 5MB");
      return;
    }

    if (form.gallery.length + files.length > 6) {
      toast.error("Maximum 6 gallery images allowed");
      return;
    }

    setUploadingGallery(true);
    try {
      const res = await uploadProductGalleryImages(files);
      const urls = res.data.map((item) => item.url);
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
      toast.success(`${urls.length} image(s) uploaded to gallery`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gallery upload failed");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index) => {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  };

  // Edit Button Click Korle Form Populate hobe
  const handleEditClick = (product) => {
    setEditingId(product._id);
    setForm({
      title: product.title || "",
      price: product.price || "",
      stock: product.stock || "",
      discount: product.discount || "",
      description: product.description || "",
      image: product.image || "",
      gallery: product.gallery || [],
      category: product.category?._id || product.category || "",
      isTrending: product.isTrending || false,
      flashSale: product.flashSale || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Form-e scroll hobe
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  // Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      toast.error("Please add a main product image (upload or URL)");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      discount: Number(form.discount) || 0,
      category: form.category || undefined,
    };

    try {
      if (editingId) {
        // UPDATE existing product
        await adminUpdateProduct(editingId, payload);
        toast.success("Product updated successfully");
      } else {
        // CREATE new product
        await adminCreateProduct(payload);
        toast.success("Product created successfully");
      }

      setEditingId(null);
      setForm(initialForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminDeleteProduct(id);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const toggleFlag = async (product, key) => {
    try {
      await adminUpdateProduct(product._id, { [key]: !product[key] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const changeDiscount = async (product) => {
    const value = prompt(`Discount % for "${product.title}"`, product.discount || 0);
    if (value === null) return;
    const discount = Math.max(0, Math.min(100, Number(value) || 0));
    try {
      await adminUpdateProduct(product._id, { discount });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {editingId ? "Edit Product" : "Manage Products"}
        </h1>
        {editingId && (
          <button
            onClick={cancelEdit}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg font-medium"
          >
            Cancel Editing
          </button>
        )}
      </div>

      {/* Product Form (Create & Edit Both Work Here) */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm mb-8 grid grid-cols-2 gap-4 border">
        <input
          required
          placeholder="Title"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <select
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          required
          type="number"
          placeholder="Price (৳)"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          required
          type="number"
          placeholder="Stock"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <input
          type="number"
          min="0"
          max="100"
          placeholder="Discount % (optional)"
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={form.discount}
          onChange={(e) => setForm({ ...form, discount: e.target.value })}
        />

        <div className="flex items-center gap-4 text-sm font-medium">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isTrending}
              onChange={(e) => setForm({ ...form, isTrending: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
            />
            Trending
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.flashSale}
              onChange={(e) => setForm({ ...form, flashSale: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
            />
            Flash Sale
          </label>
        </div>

        {/* Main Image Section */}
        <div className="col-span-2 bg-gray-50 p-3 rounded-lg border">
          <label className="block text-sm font-medium mb-2 text-gray-700">Main Product Image</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div>
              <p className="text-xs text-gray-500 mb-1">Option A — Upload Device File</p>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                disabled={uploading}
                className="border rounded-lg px-3 py-1.5 w-full text-xs bg-white"
              />
              {uploading && <p className="text-xs text-gray-400 mt-1">Uploading image...</p>}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Option B — Direct Image URL</p>
              <input
                placeholder="https://i.ibb.co/..."
                className="border rounded-lg px-3 py-2 w-full text-xs bg-white focus:outline-none"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>
          </div>

          {form.image && (
            <div className="mt-3 flex items-center gap-3">
              <img src={form.image} alt="Preview" className="w-14 h-14 object-cover rounded-lg border" />
              <button
                type="button"
                onClick={() => setForm({ ...form, image: "" })}
                className="text-xs text-red-500 font-semibold hover:underline"
              >
                Remove image
              </button>
            </div>
          )}
        </div>

        {/* Gallery Images Section */}
        <div className="col-span-2 bg-gray-50 p-3 rounded-lg border">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Gallery Images (Max 6)
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            multiple
            onChange={handleGalleryChange}
            disabled={uploadingGallery || form.gallery.length >= 6}
            className="border rounded-lg px-3 py-1.5 w-full text-xs bg-white"
          />
          {uploadingGallery && <p className="text-xs text-gray-400 mt-1">Uploading gallery...</p>}

          {form.gallery.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {form.gallery.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt={`Gallery ${i + 1}`} className="w-14 h-14 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <textarea
          required
          placeholder="Description"
          rows={3}
          className="border rounded-lg px-3 py-2 col-span-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={uploading || uploadingGallery}
            className={`flex-1 text-white py-2.5 rounded-lg font-semibold transition ${
              editingId ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Product List Table */}
      <div className="bg-white rounded-xl shadow-sm border divide-y overflow-hidden">
        {products.map((p) => (
          <div key={p._id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition">
            <img
              src={p.image}
              alt={p.title}
              className="w-12 h-12 object-cover rounded-lg border flex-shrink-0"
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{p.title}</p>
              <p className="text-xs text-gray-500">
                ৳{p.price} · Stock: {p.stock} · Sold: {p.sold || 0}
                {p.category?.name ? ` · ${p.category.name}` : ""}
              </p>
            </div>

            <button
              onClick={() => changeDiscount(p)}
              className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                p.discount > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {p.discount > 0 ? `-${p.discount}%` : "Discount"}
            </button>

            <button
              onClick={() => toggleFlag(p, "isTrending")}
              className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                p.isTrending ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              Trending
            </button>

            <button
              onClick={() => toggleFlag(p, "flashSale")}
              className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                p.flashSale ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              Flash
            </button>

            {/* EDIT BUTTON */}
            <button
              onClick={() => handleEditClick(p)}
              className="text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg font-bold transition"
            >
              Edit
            </button>

            {/* DELETE BUTTON */}
            <button
              onClick={() => handleDelete(p._id)}
              className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg font-bold transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}