"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Modal from "@/components/ui/Modal";
import ProductForm from "@/components/admin/ProductForm";
import CategoryScroll from "@/components/user/CategoryScroll";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/productApi";
import { Product, ProductPayload } from "@/types";
import { ArrowLeft, Plus, Pencil, Trash2, ShoppingCart, X } from "lucide-react";

function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: ProductPayload) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await createProduct(payload);
    }
    setModalOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Panel" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {!loading && categories.length > 0 && (
          <CategoryScroll
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        )}

        {activeCategory && (
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-sm font-medium text-gray-500">
              Showing:{" "}
              <span className="text-gray-900 font-semibold">
                {activeCategory}
              </span>
            </h2>
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full"
            >
              <X size={12} /> Clear filter
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 bg-white border border-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <ShoppingCart className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 mb-4">
              {activeCategory
                ? "No products in this category."
                : "No products yet. Add your first product."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col"
              >
                <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <ShoppingCart className="text-gray-300" size={28} />
                  )}
                </div>

                <span className="text-xs text-blue-600 font-medium mb-1">
                  {product.category}
                </span>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2 flex-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs ${
                      product.stockQuantity === 0
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {product.stockQuantity} in stock
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={14} />{" "}
                    {deletingId === product.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <ProductForm
          initialData={editingProduct ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminProductsContent />
    </ProtectedRoute>
  );
}
