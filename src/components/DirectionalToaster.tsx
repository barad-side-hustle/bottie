"use client";

import { Toaster } from "sileo";
import { useDirection } from "@/contexts/DirectionProvider";

export function DirectionalToaster() {
  const { isRTL } = useDirection();
  return <Toaster position={isRTL ? "bottom-left" : "bottom-right"} theme="light" />;
}
