'use client';

import { cn } from '../../lib/cn';

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingScreen({ fullScreen = true, message }: LoadingScreenProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4',
      fullScreen ? 'fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm' : 'py-20',
    )}>
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-primary/5" />
      </div>
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse-soft">{message}</p>
      )}
    </div>
  );
}