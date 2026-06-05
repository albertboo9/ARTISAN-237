"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";

interface AIBadgeProps {
  score: number;
  explanation?: string;
  className?: string;
}

export function AIBadge({ score, explanation, className }: AIBadgeProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Animation pulse toutes les 8 secondes comme exigé
  useEffect(() => {
    const interval = setInterval(() => {
      setShouldAnimate(true);
      setTimeout(() => setShouldAnimate(false), 2000); // L'animation dure 2s
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("relative group inline-block", className)}>
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-help transition-colors",
          "bg-brand-ai/10 text-brand-ai border border-brand-ai/20 hover:bg-brand-ai/20 hover:border-brand-ai/40",
          shouldAnimate ? "animate-pulse-soft shadow-[0_0_12px_rgba(99,102,241,0.4)]" : ""
        )}
      >
        <Sparkles size={14} className={shouldAnimate ? "animate-spin-slow" : ""} />
        <span>Match {score}%</span>
      </div>

      {/* Tooltip Hover (Custom CSS pour éviter une dépendance Shadcn supplémentaire) */}
      {explanation && (
        <div className="absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64">
          <div className="bg-inverse-surface text-inverse-on-surface text-xs rounded-lg p-3 shadow-lg border border-border/10">
            <div className="font-semibold text-brand-ai mb-1 flex items-center gap-1">
              <Sparkles size={12} /> Explication de l'IA
            </div>
            <p className="leading-relaxed text-inverse-on-surface/90">{explanation}</p>
          </div>
          {/* Petite flèche en bas */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-inverse-surface"></div>
        </div>
      )}
    </div>
  );
}
