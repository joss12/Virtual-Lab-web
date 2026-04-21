export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-white/10 ${className ?? ""}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <Skeleton className="mb-3 h-3 w-16" />
      <Skeleton className="mb-2 h-5 w-32" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function ScoreSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-white/5 px-4 py-3">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-3 flex-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
