"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Maximize2, Palette, Layers, Monitor, Calendar, Compass, Sparkles, Video, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArtworkLightbox } from "@/components/art/ArtworkLightbox";

function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
}

interface ProcessStep {
  label: string;
  imageUrl: string;
  description?: string;
}

interface ArtworkDetailViewProps {
  artwork: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    year: number;
    medium?: string | null;
    software?: string | null;
    dimensions?: string | null;
    imageUrl: string;
    videoUrl?: string | null;
    processImages?: string | null;
    tags?: string | null;
    category?: { name: string; slug: string } | null;
  };
  relatedArtworks: any[];
}

export function ArtworkDetailView({
  artwork,
  relatedArtworks = [],
}: ArtworkDetailViewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeProcessIndex, setActiveProcessIndex] = useState<number | null>(null);

  let processSteps: ProcessStep[] = [];
  if (artwork.processImages) {
    try {
      processSteps = JSON.parse(artwork.processImages);
    } catch {}
  }

  const tags = artwork.tags
    ? artwork.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const embedUrl = getYouTubeEmbedUrl(artwork.videoUrl);

  return (
    <div className="space-y-12">
      {/* Back Button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/digital-art">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Digital Art Gallery</span>
          </Link>
        </Button>
      </div>

      {/* Main Large Artwork Presentation */}
      <section className="space-y-6">
        <div className="relative group overflow-hidden rounded-2xl border border-border/80 bg-surface/50 p-2 sm:p-4 shadow-xl backdrop-blur-sm">
          <div
            onClick={() => setLightboxOpen(true)}
            className="relative h-[420px] sm:h-[580px] md:h-[680px] w-full overflow-hidden rounded-xl bg-surface-secondary cursor-zoom-in"
          >
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-[1.01]"
              priority
              sizes="100vw"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              className="absolute bottom-4 right-4 rounded-xl bg-black/75 p-3 text-white backdrop-blur-md opacity-90 transition-all hover:bg-accent hover:text-accent-foreground shadow-lg flex items-center gap-2 text-xs"
              title="Inspect Artwork Fullscreen (Esc to exit)"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Fullscreen Lightbox</span>
            </button>
          </div>
        </div>

        {/* Artwork Header & Metadata Specs */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-start border-b border-border/60 pb-10">
          {/* Left info (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" className="font-mono text-xs">
                {artwork.category?.name || "Digital Painting"}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                {artwork.year}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {artwork.title}
            </h1>

            {artwork.description && (
              <p className="text-base text-foreground/85 leading-relaxed sm:text-lg pt-2">
                {artwork.description}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-border/60 bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Specs Card (5 cols) */}
          <div className="md:col-span-5 rounded-xl border border-border/80 bg-surface/50 p-5 space-y-3.5 text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Artwork Specifications
            </h3>

            {artwork.medium && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Palette className="h-3.5 w-3.5 text-accent" />
                  Medium
                </span>
                <span className="font-medium text-foreground">{artwork.medium}</span>
              </div>
            )}

            {artwork.software && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5 text-accent" />
                  Software / Tools
                </span>
                <span className="font-medium text-foreground">{artwork.software}</span>
              </div>
            )}

            {artwork.dimensions && (
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-accent" />
                  Canvas Dimensions
                </span>
                <span className="font-mono text-foreground">{artwork.dimensions}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                Year of Creation
              </span>
              <span className="font-mono text-foreground">{artwork.year}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Speedpaint / Timelapse Video Section */}
      {embedUrl && (
        <section className="space-y-6 border-b border-border/60 pb-12">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" />
              <span>Timelapse & Speedpaint</span>
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl mt-1 flex items-center gap-2">
              <span>Creation Process Video</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              รับชมวิดีโอบันทึกกระบวนการทำงานและขั้นตอนการลงสีแบบ Speedpaint
            </p>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-black shadow-xl">
            <iframe
              src={embedUrl}
              title={`${artwork.title} speedpaint video`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Process / Behind the Work Section */}
      {processSteps.length > 0 && (
        <section className="space-y-6 border-b border-border/60 pb-12">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
              Process & Methodology
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl mt-1">
              Behind the Work: Creative Stages
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Progressive exploration from initial thumbnail values to final lighting passes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-border/80 bg-surface/40 p-3 space-y-2.5 transition-all hover:border-accent/40"
              >
                <div
                  onClick={() => setActiveProcessIndex(idx)}
                  className="relative h-44 w-full overflow-hidden rounded-lg bg-surface-secondary border border-border/60 cursor-pointer"
                >
                  <Image
                    src={step.imageUrl}
                    alt={step.label}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-tight">
                  {step.label}
                </h4>
                {step.description && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Works */}
      {relatedArtworks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              More Digital Artworks
            </h2>
            <Link
              href="/digital-art"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1"
            >
              <span>View full gallery</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedArtworks.map((rel) => (
              <Link
                key={rel.id}
                href={`/digital-art/${rel.slug}`}
                className="group rounded-xl border border-border bg-surface/40 p-3 transition-all hover:border-accent/40 hover:bg-surface"
              >
                <div className="relative mb-2.5 h-40 w-full overflow-hidden rounded-lg bg-surface-secondary border border-border/60">
                  <Image
                    src={rel.thumbnailUrl || rel.imageUrl}
                    alt={rel.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {rel.category?.name || "Digital Art"} • {rel.year}
                </span>
                <h4 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1 mt-0.5">
                  {rel.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Lightbox */}
      <ArtworkLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={artwork.imageUrl}
        title={artwork.title}
        year={artwork.year}
        medium={artwork.medium}
      />

      {/* Process Lightbox if clicked */}
      {activeProcessIndex !== null && (
        <ArtworkLightbox
          isOpen={activeProcessIndex !== null}
          onClose={() => setActiveProcessIndex(null)}
          imageUrl={processSteps[activeProcessIndex].imageUrl}
          title={`${artwork.title} — ${processSteps[activeProcessIndex].label}`}
          year={artwork.year}
          medium="Process Breakdown"
          hasPrev={activeProcessIndex > 0}
          hasNext={activeProcessIndex < processSteps.length - 1}
          onPrev={() => setActiveProcessIndex((p) => (p !== null && p > 0 ? p - 1 : p))}
          onNext={() => setActiveProcessIndex((p) => (p !== null && p < processSteps.length - 1 ? p + 1 : p))}
        />
      )}
    </div>
  );
}

export default ArtworkDetailView;
