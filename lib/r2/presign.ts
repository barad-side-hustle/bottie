import "server-only";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "./client";
import { env } from "@/lib/env";

export async function getPresignedR2Url(r2Url: string, expiresIn = 3600): Promise<string> {
  const publicUrl = env.R2_PUBLIC_URL;
  if (!publicUrl || !r2Url.includes(publicUrl)) {
    return r2Url;
  }

  const parsed = new URL(r2Url);
  const key = parsed.pathname.slice(1);

  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}
