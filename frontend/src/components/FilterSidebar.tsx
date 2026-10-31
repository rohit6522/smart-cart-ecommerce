"use client";

import { useState } from "react";
import { Filter, X, Check, Star, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  categories: { name: string; slug: string; productCount?: number }[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  availableBrands: string[];
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  selectedRating: number;
  onSelectRating: (rating: number) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  discountOnly: boolean;
  onToggleDiscount: (val: boolean) => void;
  onReset: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function FilterSidebar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  availableBrands = [],
  selectedBrands = [],
  onToggleBrand,
  minPrice,
  maxPrice,
  onPriceChange,
  selectedRating,
  onSelectRating,
  inStockOnly,
  onToggleInStock,
  discountOnly,
  onToggleDiscount,
  onReset,
  isOpenMobile = false,
  onCloseMobile,
}: FilterSidebarProps) {
  const [localMin, setLocalMin] = useState(minPrice.toString());
  const [localMax, setLocalMax] = useState(maxPrice.toString());

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onPriceChange(Number(localMin) || 0, Number(localMax) || 100000);
  };

  const Content = (
    <div className="space-y-6 text-sm">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Filter className="w-4 h-4 text-orange-500" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setLocalMin("0");
            setLocalMax("50000");
            onReset();
          }}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* 1. Category Facet */}
      <div>
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
          Categories
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onSelectCategory("")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
              selectedCategory === ""
                ? "bg-orange-50 text-orange-600 font-bold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? "bg-orange-50 text-orange-600 font-bold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-[10px] text-slate-600">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Price Range */}
      <div>
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
          Price Range (₹)
        </h4>
        <form onSubmit={handleApplyPrice} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500"
            />
            <span className="text-slate-600 text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* 3. Brands */}
      {availableBrands.length > 0 && (
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
            Brands
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {availableBrands.map((brand) => {
              const isChecked = selectedBrands.includes(brand);
              return (
                <label
                  key={brand}
                  className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none hover:text-orange-600"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleBrand(brand)}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>{brand}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Minimum Rating */}
      <div>
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
          Customer Rating
        </h4>
        <div className="space-y-1">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => onSelectRating(selectedRating === stars ? 0 : stars)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                selectedRating === stars
                  ? "bg-orange-50 text-orange-600 font-bold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span>&amp; up</span>
              </div>
              {selectedRating === stars && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Toggles: In-stock & Discounts */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
          />
        </label>
        <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
          <span>Discounted Deals Only</span>
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => onToggleDiscount(e.target.checked)}
            className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit sticky top-24">
        {Content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="font-extrabold text-base text-slate-900">Filter Products</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {Content}
            <div className="mt-8 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/20"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
