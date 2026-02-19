import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function loadLogoIcon(): Promise<string> {
  const buffer = await readFile(join(process.cwd(), "public", "images", "logo-icon.png"));
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export default async function AppleIcon() {
  const logoSrc = await loadLogoIcon();

  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <img alt="" src={logoSrc} width={180} height={180} />
    </div>,
    { ...size }
  );
}
