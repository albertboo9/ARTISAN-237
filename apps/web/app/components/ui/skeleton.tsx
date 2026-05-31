export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted/50 animate-pulse',
        className,
      )}
      {...props}
    />
  );
}