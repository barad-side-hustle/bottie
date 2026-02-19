import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

async function loadLogoIcon(): Promise<string> {
  const buffer = await readFile(join(process.cwd(), "public", "images", "logo-icon.png"));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export default async function Icon() {
  const logoSrc = await loadLogoIcon();

  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <img alt="" src={logoSrc} width={32} height={32} />
    </div>,
    { ...size }
  );
}
