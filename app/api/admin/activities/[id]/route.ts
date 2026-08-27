import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ActivitySchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [activity, revisions] = await Promise.all([
      prisma.activity.findUnique({
        where: { id },
        include: {
          blocks: { orderBy: { order: "asc" } },
        },
      }),
      prisma.revision.findMany({
        where: { entityType: "Activity", entityId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    return NextResponse.json({ activity: { ...activity, revisions } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
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
    const { timelineData, ...activityData } = body;

    const parseResult = ActivitySchema.safeParse(activityData);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        ...parseResult.data,
        eventDate: new Date(parseResult.data.eventDate),
        startDate: parseResult.data.startDate ? new Date(parseResult.data.startDate) : null,
        endDate: parseResult.data.endDate ? new Date(parseResult.data.endDate) : null,
      },
    });

    // Always sync timeline blocks: if timelineData is empty or null, delete previous timeline block
    await prisma.activityBlock.deleteMany({
      where: { activityId: id, type: "process_timeline" },
    });

    if (timelineData && timelineData.steps && timelineData.steps.length > 0) {
      await prisma.activityBlock.create({
        data: {
          activityId: id,
          type: "process_timeline",
          order: 1,
          data: JSON.stringify(timelineData),
        },
      });
    }

    const revisionCount = await prisma.revision.count({
      where: { entityType: "Activity", entityId: id },
    });

    await prisma.revision.create({
      data: {
        entityType: "Activity",
        entityId: id,
        version: revisionCount + 1,
        title: updated.title,
        snapshot: JSON.stringify({ ...updated, timelineData }),
        authorId: session.userId,
      },
    });

    return NextResponse.json({ success: true, activity: updated });
  } catch (error: any) {
    console.error("Update activity error:", error);
    return NextResponse.json({ error: error.message || "Failed to update activity" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.activity.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, activity: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update activity" }, { status: 500 });
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
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
