"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";
import { getCategoryStyle } from "@/lib/categoryStyles";

interface CategoryScrollProps {
  categories: string[];
  basePath?: string; // where clicking a category navigates to
}

export default function CategoryScroll({ categories, basePath = "/user/products" }: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 220;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleClick = (category: string) => {
    router.push(`${basePath}?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="mb-8">
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
            return (
              <button
                key={category}
                onClick={() => handleClick(category)}
                className={`flex-shrink-0 w-28 flex flex-col items-center gap-2 p-4 rounded-2xl ${bg} hover:scale-105 transition snap-start`}
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