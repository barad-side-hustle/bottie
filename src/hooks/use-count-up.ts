"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp({ end, duration = 2000, decimals = 0 }: UseCountUpOptions) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setValue(end);
      return;
    }

    const startTime = performance.now();

    function tick(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      setValue(easedProgress * end);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setValue(end);
      }
    }

    requestAnimationFrame(tick);
  }, [end, duration]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [animate]);

  const formattedValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return { formattedValue, ref };
}
