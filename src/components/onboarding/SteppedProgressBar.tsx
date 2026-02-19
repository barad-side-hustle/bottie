"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SteppedProgressBarProps {
  steps: string[];
  currentStep: number;
}

export function SteppedProgressBar({ steps, currentStep }: SteppedProgressBarProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={label} className="flex items-center gap-3 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 shrink-0",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground animate-onboarding-pulse-dot",
                  !isCompleted && !isActive && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:block whitespace-nowrap transition-colors duration-300",
                  isActive && "text-foreground",
                  isCompleted && "text-foreground",
                  !isCompleted && !isActive && "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
