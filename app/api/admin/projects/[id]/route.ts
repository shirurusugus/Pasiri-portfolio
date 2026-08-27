import { NextRequest, NextResponse } from "next/server";
import { prisma, createSafeRevision } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ProjectSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [project, revisions] = await Promise.all([
      prisma.project.findUnique({
        where: { id },
        include: {
          blocks: { orderBy: { order: "asc" } },
        },
      }),
      prisma.revision.findMany({
        where: { entityType: "Project", entityId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ project: { ...project, revisions } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
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
    const { blocks, timelineData, ...projectData } = body;

    const parseResult = ProjectSchema.safeParse(projectData);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { startDate, endDate, completedAt, ...data } = parseResult.data;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
      },
    });

    // Always sync timeline blocks: if timelineData is empty or null, delete previous timeline block
    await prisma.projectBlock.deleteMany({
      where: { projectId: id, type: "process_timeline" },
    });

    if (timelineData && timelineData.steps && timelineData.steps.length > 0) {
      await prisma.projectBlock.create({
        data: {
          projectId: id,
          type: "process_timeline",
          order: 1,
          data: JSON.stringify(timelineData),
        },
      });
    }

    const revisionCount = await prisma.revision.count({
      where: { entityType: "Project", entityId: id },
    });

    await createSafeRevision({
      entityType: "Project",
      entityId: id,
      version: revisionCount + 1,
      title: updated.title,
      snapshot: JSON.stringify({ ...updated, timelineData }),
      authorId: session.userId,
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 });
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
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
