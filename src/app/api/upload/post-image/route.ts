import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadToR2 } from "@/lib/r2/upload";
import { env } from "@/lib/env";

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

    const key = `post-images/${locationId}/${Date.now()}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const r2Url = await uploadToR2({ key, body: buffer, contentType: file.type });

    // Return a public proxy URL so external services (like Google) can fetch the image
    const proxyUrl = `${env.NEXT_PUBLIC_APP_URL}/api/upload/post-image/proxy?url=${encodeURIComponent(r2Url)}`;

    return NextResponse.json({ url: proxyUrl });
  } catch (error) {
    console.error("Error uploading post image:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
