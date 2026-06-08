"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface OnboardingFormPanelProps {
  title: string;
  description: string;
  children: ReactNode;
  progressBar?: ReactNode;
  backButton?: {
    label: string;
    loadingLabel?: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  nextButton?: {
    label: string;
    loadingLabel?: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: ReactNode;
  };
  hideNavigation?: boolean;
  className?: string;
}

export function OnboardingFormPanel({
  title,
  description,
  children,
  progressBar,
  backButton,
  nextButton,
  hideNavigation = false,
  className,
}: OnboardingFormPanelProps) {
  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      {progressBar && <div className="mb-10">{progressBar}</div>}

      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-balance text-foreground">{title}</h1>
        <p className="text-base leading-relaxed text-ink-2">{description}</p>
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1 min-h-0">{children}</div>

      {!hideNavigation && (
        <div className="flex gap-3 pt-8 mt-auto shrink-0">
          {backButton && (
            <Button
              onClick={backButton.onClick}
              variant="ghost"
              size="lg"
              className={nextButton ? "" : "flex-1"}
              disabled={backButton.disabled || backButton.loading}
            >
              {backButton.loading ? backButton.loadingLabel || backButton.label : backButton.label}
            </Button>
          )}

          {nextButton && (
            <Button
              onClick={nextButton.onClick}
              size="lg"
              className="flex-1"
              disabled={nextButton.disabled || nextButton.loading}
            >
              {nextButton.loading ? nextButton.loadingLabel || nextButton.label : nextButton.label}
              {nextButton.icon && !nextButton.loading && nextButton.icon}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
