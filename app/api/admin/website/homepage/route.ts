import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ sections });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch homepage sections" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { sections } = body;

    for (const sec of sections) {
      await prisma.homepageSection.update({
        where: { id: sec.id },
        data: {
          title: sec.title,
          subtitle: sec.subtitle,
          order: sec.order,
          isEnabled: sec.isEnabled,
          customData: sec.customData,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update sections" }, { status: 500 });
  }
}
