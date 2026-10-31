"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Upload, Plus, Trash2, Check, Image as ImageIcon } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    stock: "50",
    sku: "",
    isFeatured: false,
    tags: "",
  });

  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories?.length > 0) {
          setCategories(data.categories);
          setForm((f) => ({ ...f, category: data.categories[0]._id }));
        }
      });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImages([...images, data.url]);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Network error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleAddManualImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.brand || !form.category || !form.price || !form.sku) {
      setError("Please fill in all required fields (Name, Brand, Category, Price, SKU)");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const imagePayload = images.map((url, i) => ({
        url,
        isPrimary: i === 0,
      }));

      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
          stock: Number(form.stock) || 0,
          images: imagePayload,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message || "Something went wrong creating the product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Add New Product</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Publish a new product item to the live CartNova catalog
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Trosto SoundPro ANC Headphones"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Trosto Audio"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Stock Keeping Unit (SKU) *</label>
              <input
                type="text"
                required
                placeholder="e.g. ELC-SND-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs uppercase font-mono text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Available Stock Quantity *</label>
              <input
                type="number"
                required
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                min={1}
                placeholder="12999"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Compare at price */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Original Price (Strike-through ₹)</label>
              <input
                type="number"
                min={1}
                placeholder="19999"
                value={form.compareAtPrice}
                onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Short Description */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Short One-Line Catchphrase</label>
              <input
                type="text"
                placeholder="Premium wireless ANC headphones with 60-hour battery"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                rows={4}
                required
                placeholder="Comprehensive overview of materials, acoustics, fit, and build..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Tags */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="audio, headphones, anc, wireless, bestseller"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Featured Checkbox */}
            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="font-bold text-slate-900">Mark as Featured on Homepage Spotlight</span>
              </label>
            </div>
          </div>

          {/* Image Upload / Management Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-600" /> Product Photography
            </h3>

            {/* Upload or Add URL */}
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload from Device"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 flex gap-2">
                <input
                  type="url"
                  placeholder="Paste direct image URL (Unsplash, Cloudinary, etc.)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddManualImage}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-orange-600"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group"
                  >
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md opacity-80 hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
