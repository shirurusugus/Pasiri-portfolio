import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const q = searchParams.get("q");

    const where: any = {};
    if (folder && folder !== "all") {
      where.folder = folder;
    }
    if (q) {
      where.OR = [
        { originalName: { contains: q } },
        { altText: { contains: q } },
        { caption: { contains: q } },
      ];
    }

    const items = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items, media: items });
  } catch (error) {
    return NextResponse.json({ error: "Failed to list media." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.media.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete media." }, { status: 500 });
  }
}
