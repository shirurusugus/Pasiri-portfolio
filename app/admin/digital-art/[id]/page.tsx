import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ArtworkForm } from "@/components/admin/ArtworkForm";

interface AdminEditArtworkPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminEditArtworkPage({
  params,
}: AdminEditArtworkPageProps) {
  const { id } = await params;

  const [artwork, categories] = await Promise.all([
    prisma.artwork.findUnique({
      where: { id },
      include: {
        category: true,
      },
    }),
    prisma.artworkCategory.findMany({
      orderBy: { order: "asc" },
    }),
  ]);

  if (!artwork) notFound();

  return (
    <ArtworkForm
      initialData={artwork}
      categories={categories}
      isEditing={true}
    />
  );
}
