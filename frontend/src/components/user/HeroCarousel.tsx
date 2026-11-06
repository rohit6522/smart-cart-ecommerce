"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBasket } from "lucide-react";

interface Slide {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  imageUrl: string;
}

const slides: Slide[] = [
  {
    title: "Shop Smart, Save More",
    subtitle:
      "Track your budget in real-time while you shop your favorite products.",
    emoji: "🛒",
    gradient: "from-blue-600/70 via-blue-500/50 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&q=65&fm=webp",
  },
  {
    title: "Fresh Groceries Daily",
    subtitle: "Farm-fresh essentials delivered right to your doorstep.",
    emoji: "🥦",
    gradient: "from-green-600/70 via-green-500/50 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=65&fm=webp",
  },
  {
    title: "Latest Electronics",
    subtitle: "Top gadgets and accessories at unbeatable prices.",
    emoji: "🎧",
    gradient: "from-purple-600/70 via-purple-500/50 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1000&q=65&fm=webp",
  },
  {
    title: "Trending Fashion",
    subtitle: "Discover styles that fit every occasion and budget.",
    emoji: "👕",
    gradient: "from-pink-600/70 via-pink-500/50 to-transparent",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1000&q=65&fm=webp",
  },
];

interface HeroCarouselProps {
  onShopNow: () => void;
}

export default function HeroCarousel({ onShopNow }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-72 sm:h-96 md:h-[26rem] rounded-3xl overflow-hidden mb-8 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-200/40">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          />
          {/* Gradient overlay for text readability */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
          />
          <div className="absolute inset-0 bg-slate-950/20" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-start justify-center px-6 sm:px-14 text-white">
            <span className="text-3xl sm:text-5xl mb-2 sm:mb-3 drop-shadow">
              {slide.emoji}
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3 drop-shadow-lg leading-tight tracking-tight">
              {slide.title}
            </h1>
            <p className="text-xs sm:text-base text-white/95 font-medium mb-5 sm:mb-6 max-w-[90%] sm:max-w-md drop-shadow">
              {slide.subtitle}
            </p>

            <button
              onClick={onShopNow}
              className="flex items-center gap-2 bg-white text-slate-900 font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all shadow-lg text-xs sm:text-sm"
            >
              <ShoppingBasket size={17} /> Shop Now
            </button>
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? "w-7 sm:w-8 bg-white shadow-sm"
                : "w-2 sm:w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
