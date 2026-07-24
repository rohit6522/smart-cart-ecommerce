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
    subtitle: "Track your budget in real-time while you shop your favorite products.",
    emoji: "🛒",
    gradient: "from-blue-600/70 via-blue-500/50 to-transparent",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
  },
  {
    title: "Fresh Groceries Daily",
    subtitle: "Farm-fresh essentials delivered right to your doorstep.",
    emoji: "🥦",
    gradient: "from-green-600/70 via-green-500/50 to-transparent",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
  },
  {
    title: "Latest Electronics",
    subtitle: "Top gadgets and accessories at unbeatable prices.",
    emoji: "🎧",
    gradient: "from-purple-600/70 via-purple-500/50 to-transparent",
    imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200",
  },
  {
    title: "Trending Fashion",
    subtitle: "Discover styles that fit every occasion and budget.",
    emoji: "👕",
    gradient: "from-pink-600/70 via-pink-500/50 to-transparent",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
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
    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 shadow-sm">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          />
          {/* Gradient overlay for text readability */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
          <div className="absolute inset-0 bg-black/10" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-start justify-center px-8 sm:px-14 text-white">
            <span className="text-3xl sm:text-4xl mb-2">{slide.emoji}</span>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 drop-shadow-md">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base text-white/90 mb-5 max-w-md drop-shadow">
              {slide.subtitle}
            </p>
            <button
              onClick={onShopNow}
              className="flex items-center gap-2 bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-full hover:bg-gray-100 transition shadow-md"
            >
              <ShoppingBasket size={17} /> Shop Now
            </button>
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}