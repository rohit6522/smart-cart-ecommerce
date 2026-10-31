"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  numReviews?: number;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

export default function RatingStars({
  rating = 0,
  numReviews,
  size = "sm",
  showScore = true,
}: RatingStarsProps) {
  const iconSize = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200 fill-slate-100"
            }`}
          />
        ))}
      </div>

      {showScore && (
        <span className="text-xs font-bold text-slate-700">
          {rating.toFixed(1)}
        </span>
      )}

      {numReviews !== undefined && (
        <span className="text-xs text-slate-600">
          ({numReviews})
        </span>
      )}
    </div>
  );
}
