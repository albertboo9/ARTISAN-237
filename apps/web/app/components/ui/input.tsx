'use client';

import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-11 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
              error && 'border-destructive focus:ring-destructive/20 focus:border-destructive',
              icon && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;