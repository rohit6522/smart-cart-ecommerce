"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";
import { getCategoryStyle } from "@/lib/categoryStyles";

interface CategoryScrollProps {
  categories: string[];
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryScroll({
  categories,
  activeCategory,
  onSelect,
}: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    setPaused(true);
    const amount = 240;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleClick = (category: string) => {
    setPaused(true);
    onSelect(activeCategory === category ? null : category);
  };

  // Duplicate the list so the CSS animation can loop seamlessly
  const loopedCategories = [...categories, ...categories];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <Grid3x3 size={16} />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Shop by Category</h2>
      </div>

      <div
        className="relative flex items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll categories left"
          className="hidden sm:flex flex-shrink-0 w-9 h-9 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-full shadow-sm items-center justify-center hover:bg-slate-50 hover:scale-105 active:scale-95 text-slate-700 mr-2 z-10 transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar py-2">
          <div
            className={`flex gap-4 sm:gap-5 flex-shrink-0 ${paused ? "" : "animate-category-scroll"}`}
          >
            {loopedCategories.map((category, idx) => {
              const { icon: Icon, bg } = getCategoryStyle(category);
              const isActive = activeCategory === category;
              return (
                <button
                  key={`${category}-${idx}`}
                  onClick={() => handleClick(category)}
                  className={`flex-shrink-0 w-20 sm:w-28 flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 ${bg} ${
                    isActive
                      ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md scale-105"
                      : "border-transparent hover:border-slate-200/80"
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 shadow-xs flex items-center justify-center">
                    <Icon className="text-slate-800" size={18} />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-800 text-center leading-tight">
                    {category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => scroll("right")}
          aria-label="Scroll categories right"
          className="hidden sm:flex flex-shrink-0 w-9 h-9 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-full shadow-sm items-center justify-center hover:bg-slate-50 hover:scale-105 active:scale-95 text-slate-700 ml-2 z-10 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
