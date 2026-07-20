"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";
import { getCategoryStyle } from "@/lib/categoryStyles";

interface CategoryScrollProps {
  categories: string[];
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryScroll({ categories, activeCategory, onSelect }: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 220;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleClick = (category: string) => {
    // Clicking the already-active category clears the filter (toggle behavior)
    onSelect(activeCategory === category ? null : category);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 className="text-blue-600" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-thin px-6 pb-1 snap-x scroll-smooth"
        >
          {categories.map((category) => {
            const { icon: Icon, bg } = getCategoryStyle(category);
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleClick(category)}
                className={`flex-shrink-0 w-28 flex flex-col items-center gap-2 p-4 rounded-2xl transition ${bg} ${
                  isActive ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"
                }`}
              >
                <Icon className="text-gray-700" size={26} />
                <span className="text-xs font-medium text-gray-800 text-center leading-tight">
                  {category}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}