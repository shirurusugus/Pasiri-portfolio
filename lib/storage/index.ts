import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/webm",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export interface UploadResult {
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Please upload JPG, PNG, WebP, AVIF, SVG, MP4, or PDF.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  return { valid: true };
}

export async function saveLocalFile(
  file: File,
  folder: string = "general"
): Promise<UploadResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate safe sanitized filename: timestamp-random-sanitizedname
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
  const extension = cleanOriginalName.split(".").pop() || "bin";
  const safeFilename = `${timestamp}-${randomSuffix}.${extension}`;

  // Upload destination
  const uploadDir = join(process.cwd(), "public", "uploads", "media");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = join(uploadDir, safeFilename);
  await writeFile(filePath, buffer);

  const publicUrl = `/uploads/media/${safeFilename}`;

  return {
    filename: safeFilename,
    originalName: file.name,
    url: publicUrl,
    mimeType: file.type,
    fileSize: file.size,
  };
}
