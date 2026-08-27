import { NextRequest, NextResponse } from "next/server";
import { saveLocalFile } from "@/lib/storage";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const altText = (formData.get("altText") as string) || "";
    const caption = (formData.get("caption") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const uploadResult = await saveLocalFile(file, folder);

    // Create database record in Prisma
    const mediaRecord = await prisma.media.create({
      data: {
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        url: uploadResult.url,
        mimeType: uploadResult.mimeType,
        fileSize: uploadResult.fileSize,
        folder,
        altText,
        caption,
      },
    });

    return NextResponse.json({ success: true, media: mediaRecord });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}
