import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ArtworkDetailView } from "@/components/art/ArtworkDetailView";

interface ArtworkPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await prisma.artwork.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!artwork) return { title: "Artwork Not Found" };

  return {
    title: artwork.seoTitle || `${artwork.title} — Digital Art & Painting`,
    description:
      artwork.seoDescription ||
      artwork.description ||
      `Digital artwork by Pasiri created with ${artwork.software || "digital tools"}.`,
    openGraph: {
      title: artwork.title,
      description: artwork.description || undefined,
      images: [artwork.imageUrl],
    },
  };
}

export default async function ArtworkDetailPage({ params }: ArtworkPageProps) {
  const { slug } = await params;

  const artwork = await prisma.artwork.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!artwork || artwork.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch 3 related artworks in the same or other categories
  const relatedArtworks = await prisma.artwork.findMany({
    where: {
      status: "PUBLISHED",
      NOT: { id: artwork.id },
    },
    take: 3,
    orderBy: { sortOrder: "asc" },
    include: { category: true },
  });

  return (
    <div
      data-editable-type="artwork"
      data-editable-id={artwork.id}
      data-editable-title={artwork.title}
      data-edit-url={`/admin/digital-art/${artwork.id}`}
      data-add-url="/admin/digital-art/new"
      className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"
    >
      <ArtworkDetailView artwork={artwork} relatedArtworks={relatedArtworks} />
    </div>
  );
}
