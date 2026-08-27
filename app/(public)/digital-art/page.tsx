import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { DigitalArtGallery } from "@/components/art/DigitalArtGallery";
import { Palette, Sparkles } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Digital Art & Digital Painting — Pasiri Portfolio",
  description:
    "A curated collection of digital paintings, character concepts, environment illustrations, and atmospheric visual studies by Pasiri.",
};

export default async function DigitalArtPage() {
  const [artworks, categories] = await Promise.all([
    prisma.artwork.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
    prisma.artworkCategory.findMany({
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 space-y-12">
      {/* Page Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3.5 py-1 text-xs text-muted-foreground backdrop-blur-sm">
          <Palette className="h-3.5 w-3.5 text-accent" />
          <span>Visual Art, Painting & Illustration</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
          Digital Art & Digital Painting
        </h1>

        <p className="text-base text-foreground/80 leading-relaxed sm:text-lg">
          Personal digital paintings, character concept explorations, and atmospheric visual studies rendered across Procreate, Photoshop, and Clip Studio Paint.
        </p>
      </header>

      {/* Gallery */}
      <DigitalArtGallery artworks={artworks} categories={categories} />
    </div>
  );
}
