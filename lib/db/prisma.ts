import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function createSafeRevision(data: {
  entityType: string;
  entityId: string;
  version?: number;
  title: string;
  snapshot: string;
  authorId?: string | null;
}) {
  try {
    let validAuthorId: string | null = null;
    if (data.authorId) {
      const user = await prisma.user.findUnique({
        where: { id: data.authorId },
        select: { id: true },
      });
      if (user) validAuthorId = user.id;
    }

    await prisma.revision.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        version: data.version || 1,
        title: data.title,
        snapshot: data.snapshot,
        authorId: validAuthorId,
      },
    });
  } catch (err) {
    console.warn("Could not create revision snapshot (non-critical):", err);
  }
}

export default prisma;
