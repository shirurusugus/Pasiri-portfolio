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

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    // Validate that the uploaded file is a PDF
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid PDF document (.pdf)." },
        { status: 400 }
      );
    }

    // Save PDF file to storage under 'resume' folder
    const uploadResult = await saveLocalFile(file, "resume");

    // Also register in Media library for bookkeeping
    await prisma.media.create({
      data: {
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        url: uploadResult.url,
        mimeType: uploadResult.mimeType || "application/pdf",
        fileSize: uploadResult.fileSize,
        folder: "resume",
        altText: "Curriculum Vitae / Resume PDF",
        caption: file.name,
      },
    });

    // Update Profile record
    const profile = await prisma.profile.findFirst();
    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { resumeUrl: uploadResult.url },
      });
    } else {
      await prisma.profile.create({
        data: {
          fullName: "pasiri",
          bio: "Software Engineer & Designer",
          resumeUrl: uploadResult.url,
        },
      });
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      filename: uploadResult.originalName,
      fileSize: uploadResult.fileSize,
    });
  } catch (error: any) {
    console.error("Resume PDF upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload resume PDF." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findFirst();
    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { resumeUrl: null },
      });
    }

    return NextResponse.json({ success: true, message: "Resume removed." });
  } catch (error: any) {
    console.error("Resume removal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove resume." },
      { status: 500 }
    );
  }
}
