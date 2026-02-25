import "server-only";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "./client";
import { env } from "@/lib/env";

export async function uploadToR2({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const client = getR2Client();
  const bucket = env.R2_BUCKET_NAME;
  const publicUrl = env.R2_PUBLIC_URL;

  if (!bucket || !publicUrl) {
    throw new Error("R2_BUCKET_NAME and R2_PUBLIC_URL must be configured");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `${publicUrl}/${key}`;
}
