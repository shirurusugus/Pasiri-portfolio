import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { order: "asc" },
      include: { skills: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { action, name, categoryId, order, isFeatured, categoryName } = body;

    if (action === "create_category") {
      const cat = await prisma.skillCategory.create({
        data: { name: categoryName, order: order || 0 },
      });
      return NextResponse.json({ success: true, category: cat });
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        categoryId,
        order: order || 0,
        isFeatured: isFeatured || false,
      },
    });

    return NextResponse.json({ success: true, skill });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create skill" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get("skillId");
    const categoryId = searchParams.get("categoryId");

    if (skillId) {
      await prisma.skill.delete({ where: { id: skillId } });
    } else if (categoryId) {
      await prisma.skillCategory.delete({ where: { id: categoryId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
