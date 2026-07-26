import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  showCount?: number;
}

export default function StarRating({ rating, size = 14, showCount }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
          />
        ))}
      </div>
      {rating > 0 && (
        <span className="text-xs text-gray-500">
          {rating.toFixed(1)} {showCount !== undefined && `(${showCount})`}
        </span>
      )}
    </div>
  );
}