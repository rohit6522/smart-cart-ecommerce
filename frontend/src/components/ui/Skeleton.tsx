export function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-2xl ${className}`} />;
}

export function SkeletonText({ width = "w-full" }: { width?: string }) {
  return <div className={`h-4 skeleton-shimmer rounded ${width}`} />;
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="h-64" />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3, height = "h-24" }: { count?: number; height?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className={height} />
      ))}
    </div>
  );
}