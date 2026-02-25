import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (_client) return _client;

  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 environment variables are not configured");
  }

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return _client;
}
