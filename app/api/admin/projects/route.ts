import { NextRequest, NextResponse } from "next/server";
import { prisma, createSafeRevision } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ProjectSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { blocks: true } } },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { blocks, timelineData, ...projectData } = body;

    const parseResult = ProjectSchema.safeParse(projectData);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { startDate, endDate, completedAt, ...data } = parseResult.data;

    const created = await prisma.project.create({
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
      },
    });

    if (timelineData && timelineData.steps && timelineData.steps.length > 0) {
      await prisma.projectBlock.create({
        data: {
          projectId: created.id,
          type: "process_timeline",
          order: 1,
          data: JSON.stringify(timelineData),
        },
      });
    }

    await createSafeRevision({
      entityType: "Project",
      entityId: created.id,
      version: 1,
      title: created.title,
      snapshot: JSON.stringify({ ...created, timelineData }),
      authorId: session.userId,
    });

    return NextResponse.json({ success: true, project: created });
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}
