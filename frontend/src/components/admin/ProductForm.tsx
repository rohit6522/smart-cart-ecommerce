"use client";

import { useState } from "react";
import { Product, ProductPayload } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({
  initialData,
  onSubmit,
  onCancel,
}: ProductFormProps) {

 const [form, setForm] = useState<ProductPayload>({
  name: initialData?.name ?? "",
  description: initialData?.description ?? "",
  price: initialData?.price ?? 0,
  discountPercentage: initialData?.discountPercentage ?? 0,
  stockQuantity: initialData?.stockQuantity ?? 0,
  category: initialData?.category ?? "",
  imageUrl: initialData?.imageUrl ?? "",
  variants: initialData?.variants?.map((v) => ({
    variantType: v.variantType,
    variantValue: v.variantValue,
    stockQuantity: v.stockQuantity,
  })) ?? [],
});

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "stockQuantity" ||
        name === "discountPercentage"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || form.price <= 0 || form.stockQuantity < 0) {
      setError("Please fill all required fields with valid values");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => {
  setForm((prev) => ({
    ...prev,
    variants: [...prev.variants, { variantType: "Size", variantValue: "", stockQuantity: 0 }],
  }));
};

const updateVariant = (index: number, field: string, value: string | number) => {
  setForm((prev) => ({
    ...prev,
    variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
  }));
};

const removeVariant = (index: number) => {
  setForm((prev) => ({
    ...prev,
    variants: prev.variants.filter((_, i) => i !== index),
  }));
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹)
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            min={0}
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Qty
          </label>
          <input
            type="number"
            name="stockQuantity"
            value={form.stockQuantity}
            onChange={handleChange}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Discount (%){" "}
          <span className="text-gray-400 font-normal">
            — for festive sales, leave 0 for none
          </span>
        </label>
        <input
          type="number"
          name="discountPercentage"
          value={form.discountPercentage}
          onChange={handleChange}
          min={0}
          max={100}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {form.discountPercentage > 0 && form.price > 0 && (
          <p className="text-xs text-green-600 mt-1">
            Discounted price: ₹
            {(
              form.price -
              (form.price * form.discountPercentage) / 100
            ).toFixed(2)}
          </p>
        )}
      </div>

      <div>
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700">
      Variants <span className="text-gray-400 font-normal">(optional — e.g. Size, Color)</span>
    </label>
    <button
      type="button"
      onClick={addVariant}
      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
    >
      <Plus size={13} /> Add Variant
    </button>
  </div>

  {form.variants.length > 0 && (
    <div className="space-y-2">
      {form.variants.map((variant, index) => (
        <div key={index} className="flex gap-2 items-center">
          <select
            value={variant.variantType}
            onChange={(e) => updateVariant(index, "variantType", e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-24"
          >
            <option value="Size">Size</option>
            <option value="Color">Color</option>
          </select>
          <input
            type="text"
            placeholder="e.g. M, Red"
            value={variant.variantValue}
            onChange={(e) => updateVariant(index, "variantValue", e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            placeholder="Stock"
            value={variant.stockQuantity}
            onChange={(e) => updateVariant(index, "stockQuantity", Number(e.target.value))}
            className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => removeVariant(index)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )}
</div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="e.g. Groceries, Electronics"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : initialData
              ? "Update Product"
              : "Add Product"}
        </button>
      </div>
    </form>
  );
}
