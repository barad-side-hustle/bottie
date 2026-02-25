import type { QrCodeSettings } from "@/lib/types/qr-settings.types";

export function getDefaultQrSettings(): QrCodeSettings {
  return {
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    logoUrl: null,
    logoSize: 0.3,
    frameStyle: "badge",
    frameColor: "#000000",
    frameText: "Scan me",
    frameTextColor: "#ffffff",
    frameTextFont: "sans-serif",
    frameTextSize: 17,
    linkType: "review",
    customUrl: "",
  };
}
