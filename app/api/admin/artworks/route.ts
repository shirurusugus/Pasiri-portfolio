import { NextRequest, NextResponse } from "next/server";
import { prisma, createSafeRevision } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ArtworkSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const artworks = await prisma.artwork.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    });

    return NextResponse.json({ artworks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parseResult = ArtworkSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { date, ...data } = parseResult.data;

    const created = await prisma.artwork.create({
      data: {
        ...data,
        date: date ? new Date(date) : new Date(),
      },
    });

    await createSafeRevision({
      entityType: "Artwork",
      entityId: created.id,
      version: 1,
      title: created.title,
      snapshot: JSON.stringify(created),
      authorId: session.userId,
    });

    return NextResponse.json({ success: true, artwork: created });
  } catch (error: any) {
    console.error("Create artwork error:", error);
    return NextResponse.json({ error: error.message || "Failed to create artwork" }, { status: 500 });
  }
}
