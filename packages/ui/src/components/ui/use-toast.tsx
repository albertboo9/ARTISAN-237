import * as React from 'react';
import { cn } from '../../lib/cn';

interface ToastProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
}

export function Toast({ title, description, action, variant = 'default' }: ToastProps) {
  return (
    <div
      className={cn(
        'group pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        variant === 'default' && 'bg-popover text-popover-foreground border-border',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground border-destructive',
        variant === 'success' && 'bg-green-600 text-white border-green-700',
      )}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action}
    </div>
  );
}

// Simple toast hook
let toastCounter = 0;

export function toast(options: ToastProps & { duration?: number } = {}) {
  const id = ++toastCounter;
  const duration = options.duration || 4000;

  const container = document.getElementById('toast-portal') || createPortal();

  const element = document.createElement('div');
  element.id = `toast-${id}`;

  const close = () => {
    element.remove();
  };

  setTimeout(close, duration);

  container.appendChild(element);

  return { id, dismiss: close };
}

function createPortal(): HTMLElement {
  const portal = document.createElement('div');
  portal.id = 'toast-portal';
  portal.className = 'fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col-reverse gap-2 p-4';
  document.body.appendChild(portal);
  return portal;
}

export function Toaster() {
  return (
    <div className="fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col-reverse gap-2 p-4 pointer-events-none">
      <div id="toast-portal" className="flex flex-col-reverse gap-2 pointer-events-auto" />
    </div>
  );
}