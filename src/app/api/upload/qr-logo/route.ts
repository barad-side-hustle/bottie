import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadToR2 } from "@/lib/r2/upload";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const locationId = formData.get("locationId") as string | null;

    if (!file || !locationId) {
      return NextResponse.json({ error: "File and locationId are required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: PNG, JPEG, WebP" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 5MB" }, { status: 400 });
    }

    const key = `qr-logos/${locationId}/logo`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const baseUrl = await uploadToR2({ key, body: buffer, contentType: file.type });
    const url = `${baseUrl}?t=${Date.now()}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading QR logo:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
