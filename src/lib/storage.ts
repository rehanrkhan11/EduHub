import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;
const CDN_URL = process.env.AWS_CDN_URL ?? `https://${BUCKET}.s3.amazonaws.com`;

// Allowed MIME types for note uploads
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export function buildPublicUrl(fileKey: string): string {
  return `${CDN_URL}/${fileKey}`;
}

/**
 * Generate a presigned PUT URL so the client uploads directly to S3.
 * The server never touches the file bytes — bandwidth stays off your bill.
 */
export async function createPresignedUploadUrl(options: {
  fileName: string;
  fileType: string;
  userId: string;
  folder?: string; // e.g. "notes" (default) or "resources"
}): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
  if (!ALLOWED_TYPES.includes(options.fileType)) {
    throw new Error(`File type "${options.fileType}" is not allowed.`);
  }

  const ext = options.fileName.split(".").pop();
  const folder = options.folder ?? "notes";
  const fileKey = `${folder}/${options.userId}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
    ContentType: options.fileType,
    ContentLength: MAX_FILE_SIZE_BYTES, // enforced client-side; S3 will reject larger payloads
    Metadata: { uploadedBy: options.userId },
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

  return { uploadUrl, fileKey, publicUrl: buildPublicUrl(fileKey) };
}

/**
 * Generate a short-lived presigned GET URL for authenticated downloads.
 * Never expose the raw S3 URL publicly.
 */
export async function createPresignedDownloadUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: fileKey });
  return getSignedUrl(s3, command, { expiresIn: 60 }); // 1 min — enough for redirect
}

/**
 * Hard-delete a file from S3. Call when a NoteFile record is deleted.
 */
export async function deleteFile(fileKey: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: fileKey }));
}
