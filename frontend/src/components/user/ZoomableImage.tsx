"use client";

import { useState, useRef } from "react";
import { ShoppingCart } from "lucide-react";

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export default function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const [isZooming, setIsZooming] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  if (!src) {
    return (
      <div className="h-56 sm:h-72 bg-gray-100 rounded-xl flex items-center justify-center">
        <ShoppingCart className="text-gray-300" size={48} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-56 sm:h-72 bg-gray-100 rounded-xl overflow-hidden sm:cursor-zoom-in"
      onMouseEnter={() => setIsZooming(true)}
      onMouseLeave={() => setIsZooming(false)}
      onMouseMove={handleMouseMove}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-150 ease-out"
        style={{
          transform: isZooming ? "scale(2)" : "scale(1)",
          transformOrigin: `${position.x}% ${position.y}%`,
        }}
      />
      {isZooming && (
        <div className="hidden sm:block absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
          Zoomed
        </div>
      )}
    </div>
  );
}