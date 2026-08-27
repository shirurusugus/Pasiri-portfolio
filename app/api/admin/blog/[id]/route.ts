import { NextRequest, NextResponse } from "next/server";
import { prisma, createSafeRevision } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { BlogPostSchema } from "@/lib/validation/schemas";
import { calculateReadingTime } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [post, revisions, categories] = await Promise.all([
      prisma.blogPost.findUnique({
        where: { id },
        include: {
          category: true,
          blocks: { orderBy: { order: "asc" } },
        },
      }),
      prisma.revision.findMany({
        where: { entityType: "BlogPost", entityId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.blogCategory.findMany(),
    ]);

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ post: { ...post, revisions }, categories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
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
    const { timelineData, tags, ...postData } = body;

    const parseResult = BlogPostSchema.safeParse({ ...postData, tags });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const readingTimeMin = calculateReadingTime(parseResult.data.rawContent || parseResult.data.excerpt);

    const existing = await prisma.blogPost.findUnique({ where: { id } });

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: parseResult.data.title,
        slug: parseResult.data.slug,
        excerpt: parseResult.data.excerpt,
        coverImage: parseResult.data.coverImage,
        author: parseResult.data.author,
        categoryId: parseResult.data.categoryId,
        readingTimeMin,
        status: parseResult.data.status,
        featured: parseResult.data.featured,
        publishedAt:
          parseResult.data.status === "PUBLISHED" && !existing?.publishedAt
            ? new Date()
            : existing?.publishedAt,
        seoTitle: parseResult.data.seoTitle,
        seoDescription: parseResult.data.seoDescription,
        rawContent: parseResult.data.rawContent,
      },
    });

    // Always sync timeline blocks: if timelineData is empty or null, delete previous timeline block
    await prisma.blogBlock.deleteMany({
      where: { postId: id, type: "process_timeline" },
    });

    if (timelineData && timelineData.steps && timelineData.steps.length > 0) {
      await prisma.blogBlock.create({
        data: {
          postId: id,
          type: "process_timeline",
          order: 1,
          data: JSON.stringify(timelineData),
        },
      });
    }

    const revisionCount = await prisma.revision.count({
      where: { entityType: "BlogPost", entityId: id },
    });

    await createSafeRevision({
      entityType: "BlogPost",
      entityId: id,
      version: revisionCount + 1,
      title: updated.title,
      snapshot: JSON.stringify({ ...updated, timelineData }),
      authorId: session.userId,
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error("Update blog post error:", error);
    return NextResponse.json({ error: error.message || "Failed to update article" }, { status: 500 });
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
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
