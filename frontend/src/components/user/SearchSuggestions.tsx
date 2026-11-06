"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAllProducts } from "@/lib/productApi";
import { Product } from "@/types";
import { ShoppingCart, Search } from "lucide-react";

interface SearchSuggestionsProps {
  query: string;
  onClose: () => void;
  onSelectCategory?: (category: string) => void;
}

export default function SearchSuggestions({ query, onClose, onSelectCategory }: SearchSuggestionsProps) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const products = await getAllProducts();
        const matches = products
          .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6);
        setResults(matches);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 250); // debounce so we don't filter on every keystroke instantly

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectProduct = (productId: number) => {
    router.push(`/user/products/${productId}`);
    onClose();
  };

  if (!query.trim()) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 max-h-96 overflow-y-auto"
    >
      {loading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-400">
          <Search className="mx-auto mb-2 text-gray-300" size={24} />
          No products found for &quot;{query}&quot;
        </div>
      ) : (
        <div className="py-2">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelectProduct(product.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingCart className="text-gray-300" size={16} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-400">{product.category}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                ₹{(product.discountedPrice || product.price).toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}