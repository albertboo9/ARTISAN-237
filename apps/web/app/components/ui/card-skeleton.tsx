export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow',
        'animate-pulse',
        className,
      )}
    >
      <div className="p-6 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-full" />
      </div>
    </div>
  );
}