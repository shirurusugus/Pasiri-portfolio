import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ExperienceSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ experiences });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parseResult = ExperienceSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const created = await prisma.experience.create({
      data: {
        ...parseResult.data,
        startDate: new Date(parseResult.data.startDate),
        endDate: parseResult.data.endDate ? new Date(parseResult.data.endDate) : null,
      },
    });

    return NextResponse.json({ success: true, experience: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create experience" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...data } = body;

    const parseResult = ExperienceSchema.safeParse(data);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const updated = await prisma.experience.update({
      where: { id },
      data: {
        ...parseResult.data,
        startDate: new Date(parseResult.data.startDate),
        endDate: parseResult.data.endDate ? new Date(parseResult.data.endDate) : null,
      },
    });

    return NextResponse.json({ success: true, experience: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.experience.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}
