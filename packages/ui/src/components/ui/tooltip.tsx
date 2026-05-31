'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

export interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayMs?: number;
}

export function Tooltip({ children, content, side = 'top', delayMs = 0 }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delayMs);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <>
      <div onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            className={cn(
              'fixed z-50 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md',
              side === 'top' && 'bottom-full mb-2',
              side === 'bottom' && 'top-full mt-2',
              side === 'left' && 'right-full mr-2',
              side === 'right' && 'left-full ml-2',
            )}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}