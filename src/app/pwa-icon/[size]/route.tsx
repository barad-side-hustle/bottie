import Image from "next/image";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const THEME_COLOR = "#0f74c5";

const VALID_SIZES: Record<string, { dimension: number; maskable: boolean }> = {
  "192": { dimension: 192, maskable: false },
  "512": { dimension: 512, maskable: false },
  "maskable-192": { dimension: 192, maskable: true },
  "maskable-512": { dimension: 512, maskable: true },
};

async function loadLogoIcon(): Promise<string> {
  const buffer = await readFile(join(process.cwd(), "public", "images", "logo-icon.png"));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const config = VALID_SIZES[size];

  if (!config) {
    return new Response("Not found", { status: 404 });
  }

  const logoSrc = await loadLogoIcon();
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
        background: maskable ? THEME_COLOR : "transparent",
      }}
    >
      <Image alt="" src={logoSrc} width={logoSize} height={logoSize} />
    </div>,
    { width: dimension, height: dimension }
  );
}
