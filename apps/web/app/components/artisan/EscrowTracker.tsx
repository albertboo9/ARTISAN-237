"use client";

import React from "react";
import { Check, Clock, ShieldCheck, Wallet } from "lucide-react";
import { cn } from "../../lib/cn";

type EscrowStep = "QUOTE" | "LOCKED" | "IN_PROGRESS" | "RELEASED";

interface EscrowTrackerProps {
  currentStep: EscrowStep;
  className?: string;
}

export function EscrowTracker({ currentStep, className }: EscrowTrackerProps) {
  const steps = [
    { id: "QUOTE", label: "Devis accepté", icon: Wallet },
    { id: "LOCKED", label: "Fonds bloqués", icon: ShieldCheck },
    { id: "IN_PROGRESS", label: "En travaux", icon: Clock },
    { id: "RELEASED", label: "Fonds libérés", icon: Check },
  ];

  const getStepIndex = (step: EscrowStep) => steps.findIndex((s) => s.id === step);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className={cn("w-full max-w-3xl mx-auto py-6", className)}>
      <div className="relative flex justify-between">
        {/* Ligne de progression en arrière-plan */}
        <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-surface-container-high -z-10 rounded-full">
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Étapes */}
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  isCompleted
                    ? "bg-brand-primary text-on-primary shadow-[0_0_15px_rgba(0,108,73,0.3)]"
                    : "bg-surface-container-high text-on-surface-variant border-2 border-surface-container-high"
                )}
              >
                <Icon size={18} strokeWidth={isCurrent ? 3 : 2} />
              </div>
              <span
                className={cn(
                  "text-xs font-semibold text-center mt-1 transition-colors duration-500",
                  isCompleted ? "text-on-surface" : "text-on-surface-variant"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
