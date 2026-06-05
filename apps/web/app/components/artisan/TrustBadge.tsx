"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "../../lib/cn";

interface TrustBadgeProps {
  score: number;
  label?: string;
  className?: string;
}

export function TrustBadge({ score, label = "Vérifié", className }: TrustBadgeProps) {
  // Trust Green est la couleur principale
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none",
        "bg-brand-primary/10 text-brand-primary border border-brand-primary/30",
        className
      )}
      title={`Trust Score: ${score}/100`}
    >
      <ShieldCheck size={14} className="text-brand-primary" strokeWidth={2.5} />
      <span>{label}</span>
    </div>
  );
}
