import React from "react";
import { prisma } from "@/lib/db/prisma";
import { ArtworkForm } from "@/components/admin/ArtworkForm";

export const dynamic = "force-dynamic";

export default async function AdminNewArtworkPage() {
  const categories = await prisma.artworkCategory.findMany({
    orderBy: { order: "asc" },
  });

  return <ArtworkForm categories={categories} isEditing={false} />;
}
