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
    const amount = 240;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleClick = (category: string) => {
    onSelect(activeCategory === category ? null : category);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 className="text-blue-600" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
      </div>

      <div className="relative flex items-center">
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex flex-shrink-0 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-sm items-center justify-center hover:bg-gray-50 mr-2 z-10"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-thin py-1 snap-x scroll-smooth"
        >
          {categories.map((category) => {
            const { icon: Icon, bg } = getCategoryStyle(category);
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleClick(category)}
                className={`flex-shrink-0 w-28 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition ${bg} ${
                  isActive ? "border-blue-500" : "border-transparent hover:border-gray-200"
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
          className="hidden sm:flex flex-shrink-0 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-sm items-center justify-center hover:bg-gray-50 ml-2 z-10"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}