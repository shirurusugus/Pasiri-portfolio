import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ProfileSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({
      include: { educations: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parseResult = ProfileSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const existing = await prisma.profile.findFirst();
    let profile;

    if (existing) {
      profile = await prisma.profile.update({
        where: { id: existing.id },
        data: parseResult.data,
      });
    } else {
      profile = await prisma.profile.create({
        data: parseResult.data,
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
