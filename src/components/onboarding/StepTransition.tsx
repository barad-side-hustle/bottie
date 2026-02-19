"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useDirection } from "@/contexts/DirectionProvider";

interface StepTransitionProps {
  stepKey: string;
  direction: "forward" | "backward" | "initial";
  children: ReactNode;
}

export function StepTransition({ stepKey, direction, children }: StepTransitionProps) {
  const { isRTL } = useDirection();

  let animClass = "animate-onboarding-fade-in";
  if (direction !== "initial") {
    const effectiveForward = isRTL ? direction === "backward" : direction === "forward";
    animClass = effectiveForward ? "animate-onboarding-slide-forward" : "animate-onboarding-slide-backward";
  }

  return (
    <div key={stepKey} className={cn("w-full h-full", animClass)}>
      {children}
    </div>
  );
}
