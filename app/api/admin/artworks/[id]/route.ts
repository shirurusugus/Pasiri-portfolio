import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ArtworkSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [artwork, revisions] = await Promise.all([
      prisma.artwork.findUnique({
        where: { id },
        include: {
          category: true,
        },
      }),
      prisma.revision.findMany({
        where: { entityType: "Artwork", entityId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    if (!artwork) return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    return NextResponse.json({ artwork: { ...artwork, revisions } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch artwork" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const parseResult = ArtworkSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { date, ...data } = parseResult.data;

    const updated = await prisma.artwork.update({
      where: { id },
      data: {
        ...data,
        date: date ? new Date(date) : new Date(),
      },
    });

    const revisionCount = await prisma.revision.count({
      where: { entityType: "Artwork", entityId: id },
    });

    await prisma.revision.create({
      data: {
        entityType: "Artwork",
        entityId: id,
        version: revisionCount + 1,
        title: updated.title,
        snapshot: JSON.stringify(updated),
        authorId: session.userId,
      },
    });

    return NextResponse.json({ success: true, artwork: updated });
  } catch (error: any) {
    console.error("Update artwork error:", error);
    return NextResponse.json({ error: error.message || "Failed to update artwork" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.artwork.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete artwork" }, { status: 500 });
  }
}
