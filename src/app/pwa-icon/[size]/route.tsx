import { ImageResponse } from "next/og";
import { BotIconSvg, BRAND_BLUE } from "@/lib/brand/logo";

const VALID_SIZES: Record<string, { dimension: number; maskable: boolean }> = {
  "192": { dimension: 192, maskable: false },
  "512": { dimension: 512, maskable: false },
  "maskable-192": { dimension: 192, maskable: true },
  "maskable-512": { dimension: 512, maskable: true },
};

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const config = VALID_SIZES[size];

  if (!config) {
    return new Response("Not found", { status: 404 });
  }

  const { dimension, maskable } = config;
  const logoSize = maskable ? Math.round(dimension * 0.6) : dimension;

  return new ImageResponse(
    <div
      style={{
        width: dimension,
        height: dimension,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: maskable ? BRAND_BLUE : "transparent",
      }}
    >
      <BotIconSvg size={logoSize} color={maskable ? "#ffffff" : undefined} />
    </div>,
    { width: dimension, height: dimension }
  );
}
