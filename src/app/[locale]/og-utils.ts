import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const DARK_TEXT = "#1a1a2e";
export const MUTED_TEXT = "#6b7280";
export const PASTEL_LAVENDER = "#e0d4f5";
export const PASTEL_SKY = "#d4e8f5";
export const BG_LIGHT = "#f8f7ff";

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
