"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SteppedProgressBarProps {
  steps: string[];
  currentStep: number;
}

export function SteppedProgressBar({ steps, currentStep }: SteppedProgressBarProps) {
  return (
    <ol className="flex items-center gap-3 w-full">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <li
            key={label}
            className="flex items-center gap-3 flex-1 last:flex-none"
            aria-current={isActive ? "step" : undefined}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium tabular-nums shrink-0 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive && "border border-line-strong bg-surface-2 text-foreground",
                  !isCompleted && !isActive && "border border-hairline bg-surface text-ink-3"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-sm hidden sm:block whitespace-nowrap transition-colors duration-[var(--dur-fast)]",
                  isActive && "font-medium text-foreground",
                  isCompleted && "text-foreground",
                  !isCompleted && !isActive && "text-ink-3"
                )}
              >
                {label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-hairline overflow-hidden">
                <div
                  className="h-full bg-primary transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-standard)]"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
