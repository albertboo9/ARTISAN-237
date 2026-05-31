import * as React from 'react';
import { cn } from '../../lib/cn';

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

const SheetContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void }>({
  open: false,
  onOpenChange: () => {},
});

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, open, onOpenChange, children, ...props }, ref) => (
    <SheetContext.Provider value={{ open: !!open, onOpenChange: onOpenChange || (() => {}) }}>
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        {children}
      </div>
    </SheetContext.Provider>
  ),
);
Sheet.displayName = 'Sheet';

const SheetTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, onClick, ...props }, ref) => {
    const { onOpenChange } = React.useContext(SheetContext);
    return (
      <button
        ref={ref}
        className={cn('text-sm font-medium', className)}
        onClick={(e) => {
          onOpenChange(true);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
    );
  },
);
SheetTrigger.displayName = 'SheetTrigger';

const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: 'left' | 'right' }>(
  ({ className, side = 'right', children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(SheetContext);
    if (!open) return null;
    return (
      <div className={cn('fixed inset-0 z-50 bg-black/50', className)} onClick={() => onOpenChange(false)}>
        <div
          ref={ref}
          className={cn(
            'fixed bg-background p-6 shadow-lg transition ease-in-out overflow-y-auto',
            side === 'right' ? 'right-0 top-0 h-full w-[300px] border-l' : 'left-0 top-0 h-full w-[300px] border-r',
            className,
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetContent, SheetTrigger };