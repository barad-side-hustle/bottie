import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "@/lib/r2/client";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const publicUrl = env.R2_PUBLIC_URL;
  if (!publicUrl || !url.startsWith(publicUrl)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 403 });
  }

  try {
    // Extract R2 key from URL, stripping the public URL prefix and query params
    const parsed = new URL(url);
    const key = parsed.pathname.slice(1); // remove leading /

    const client = getR2Client();
    const result = await client.send(
      new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      })
    );

    if (!result.Body) {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }

    const bytes = await result.Body.transformToByteArray();
    const contentType = result.ContentType || "image/png";

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 502 });
  }
}
