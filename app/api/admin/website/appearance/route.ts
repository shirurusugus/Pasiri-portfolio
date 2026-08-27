import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const theme = await prisma.themeSetting.findFirst();
    return NextResponse.json({ theme });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { accentColor, accentHover, fontFamily, borderRadius, smokeveilDark, smokeveilLight } = body;

    const existing = await prisma.themeSetting.findFirst();
    let theme;

    if (existing) {
      theme = await prisma.themeSetting.update({
        where: { id: existing.id },
        data: {
          accentColor,
          accentHover,
          fontFamily,
          borderRadius,
          smokeveilDark,
          smokeveilLight,
        },
      });
    } else {
      theme = await prisma.themeSetting.create({
        data: {
          accentColor,
          accentHover,
          fontFamily,
          borderRadius,
          smokeveilDark,
          smokeveilLight,
        },
      });
    }

    return NextResponse.json({ success: true, theme });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update theme" }, { status: 500 });
  }
}
