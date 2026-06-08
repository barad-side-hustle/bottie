import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const BG_LIGHT = "#F6F4EF";
export const DARK_TEXT = "#2B2A27";
export const MUTED_TEXT = "#6B6A65";
export const ACCENT_TEAL = "#1F7B83";
export const PASTEL_LAVENDER = ACCENT_TEAL;
export const PASTEL_SKY = ACCENT_TEAL;

const fontFiles: Record<number, string> = {
  400: "Rubik-Regular.ttf",
  700: "Rubik-Bold.ttf",
};

export async function loadRubikFont(weight: 400 | 700 = 700): Promise<Buffer> {
  return readFile(join(process.cwd(), "assets", fontFiles[weight]));
}

const HEBREW_RE = /[\u0590-\u05FF]/;

export function fixRtlText(text: string): string {
  return text
    .split(" ")
    .reverse()
    .map((word) => (HEBREW_RE.test(word) ? word.split("").reverse().join("") : word))
    .join(" ");
}
