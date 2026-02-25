export type DotType = "square" | "dots" | "rounded" | "extra-rounded" | "classy" | "classy-rounded";
export type CornerSquareType = "square" | "dot" | "extra-rounded";
export type CornerDotType = "square" | "dot";
export type FrameStyle = "none" | "simple" | "rounded" | "badge";
export type FrameFont = "sans-serif" | "serif" | "monospace" | "cursive" | "arial" | "georgia" | "impact" | "verdana";
export type QrLinkType = "review" | "googleMaps" | "custom";

export interface QrCodeSettings {
  foregroundColor: string;
  backgroundColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  logoUrl: string | null;
  logoSize: number;
  frameStyle: FrameStyle;
  frameColor: string;
  frameText: string;
  frameTextColor: string;
  frameTextFont: FrameFont;
  frameTextSize: number;
  linkType: QrLinkType;
  customUrl: string;
}
