import { NextRequest, NextResponse } from "next/server";
import { prisma, createSafeRevision } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ActivitySchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ activities });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { timelineData, ...activityData } = body;

    const parseResult = ActivitySchema.safeParse(activityData);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const created = await prisma.activity.create({
      data: {
        ...parseResult.data,
        eventDate: new Date(parseResult.data.eventDate),
        startDate: parseResult.data.startDate ? new Date(parseResult.data.startDate) : null,
        endDate: parseResult.data.endDate ? new Date(parseResult.data.endDate) : null,
      },
    });

    if (timelineData && timelineData.steps && timelineData.steps.length > 0) {
      await prisma.activityBlock.create({
        data: {
          activityId: created.id,
          type: "process_timeline",
          order: 1,
          data: JSON.stringify(timelineData),
        },
      });
    }

    await createSafeRevision({
      entityType: "Activity",
      entityId: created.id,
      version: 1,
      title: created.title,
      snapshot: JSON.stringify({ ...created, timelineData }),
      authorId: session.userId,
    });

    return NextResponse.json({ success: true, activity: created });
  } catch (error: any) {
    console.error("Create activity error:", error);
    return NextResponse.json({ error: error.message || "Failed to create activity" }, { status: 500 });
  }
}
