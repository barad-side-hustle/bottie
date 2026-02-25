import type { QrCodeSettings } from "@/lib/types/qr-settings.types";
import type { QrStyledHandle } from "./QrStyled";

export async function downloadQrPng(
  qrHandle: QrStyledHandle,
  settings: QrCodeSettings,
  qrSize: number,
  filename: string
): Promise<void> {
  if (settings.frameStyle === "none") {
    const blob = await qrHandle.getRawData("png");
    if (!blob) return;
    downloadBlob(blob, `${filename}.png`);
    return;
  }

  const canvas = qrHandle.getCanvas();
  if (!canvas) return;

  const padding = 16;
  const borderWidth = 3;
  const hasBadge = settings.frameStyle === "badge" && settings.frameText;
  const badgeHeight = hasBadge ? 36 : 0;
  const isRounded = settings.frameStyle === "rounded" || settings.frameStyle === "badge";
  const borderRadius = isRounded ? 16 : 0;

  const totalWidth = qrSize + padding * 2 + borderWidth * 2;
  const totalHeight = qrSize + padding * 2 + borderWidth * 2 + badgeHeight;

  const offscreen = document.createElement("canvas");
  offscreen.width = totalWidth;
  offscreen.height = totalHeight;
  const ctx = offscreen.getContext("2d")!;

  ctx.fillStyle = settings.frameColor;
  if (borderRadius > 0) {
    roundRect(ctx, 0, 0, totalWidth, totalHeight, borderRadius);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, totalWidth, totalHeight);
  }

  ctx.fillStyle = settings.backgroundColor;
  const innerX = borderWidth;
  const innerY = borderWidth;
  const innerW = totalWidth - borderWidth * 2;
  const innerH = totalHeight - borderWidth * 2 - badgeHeight;
  if (borderRadius > 0) {
    const innerRadius = Math.max(0, borderRadius - borderWidth);
    if (hasBadge) {
      roundRectPartial(ctx, innerX, innerY, innerW, innerH, innerRadius, innerRadius, 0, 0);
    } else {
      roundRect(ctx, innerX, innerY, innerW, innerH, innerRadius);
    }
    ctx.fill();
  } else {
    ctx.fillRect(innerX, innerY, innerW, innerH);
  }

  ctx.drawImage(canvas, borderWidth + padding, borderWidth + padding, qrSize, qrSize);

  if (hasBadge) {
    ctx.fillStyle = settings.frameTextColor;
    ctx.font = `bold 14px ${settings.frameTextFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(settings.frameText, totalWidth / 2, totalHeight - badgeHeight / 2 - borderWidth);
  }

  offscreen.toBlob((blob) => {
    if (blob) downloadBlob(blob, `${filename}.png`);
  }, "image/png");
}

export async function downloadQrSvg(qrHandle: QrStyledHandle, filename: string): Promise<void> {
  const blob = await qrHandle.getRawData("svg");
  if (!blob) return;
  downloadBlob(blob, `${filename}.svg`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectPartial(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tl: number,
  tr: number,
  br: number,
  bl: number
) {
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}
