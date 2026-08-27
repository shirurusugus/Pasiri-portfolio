import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const seo = await prisma.sEOSetting.findFirst();
    return NextResponse.json({ seo });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch SEO settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { siteTitle, siteDescription, authorName, keywords, defaultOgImage, twitterHandle, robotsTxt, sitemapEnabled } = body;

    const existing = await prisma.sEOSetting.findFirst();
    let seo;

    if (existing) {
      seo = await prisma.sEOSetting.update({
        where: { id: existing.id },
        data: { siteTitle, siteDescription, authorName, keywords, defaultOgImage, twitterHandle, robotsTxt, sitemapEnabled },
      });
    } else {
      seo = await prisma.sEOSetting.create({
        data: { siteTitle, siteDescription, authorName, keywords, defaultOgImage, twitterHandle, robotsTxt, sitemapEnabled },
      });
    }

    return NextResponse.json({ success: true, seo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update SEO" }, { status: 500 });
  }
}
