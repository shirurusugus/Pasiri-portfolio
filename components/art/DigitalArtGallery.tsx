"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Maximize2, ArrowRight, Sparkles, Video, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ArtworkLightbox } from "@/components/art/ArtworkLightbox";
import { cn } from "@/lib/utils";

function GalleryCardImage({
  src,
  alt,
  fallbackSrc,
}: {
  src: string;
  alt: string;
  fallbackSrc?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-surface-secondary/80 p-4 text-center">
        <Palette className="h-8 w-8 text-accent/50 mb-2" />
        <span className="text-[11px] font-medium text-foreground line-clamp-1">{alt}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">Visual Artwork</span>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => {
        if (fallbackSrc && imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else {
          setHasError(true);
        }
      }}
    />
  );
}

interface ArtworkCategory {
  id: string;
  name: string;
  slug: string;
}

interface Artwork {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  year: number;
  medium?: string | null;
  software?: string | null;
  dimensions?: string | null;
  imageUrl: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  featured: boolean;
  category?: ArtworkCategory | null;
}

interface DigitalArtGalleryProps {
  artworks: Artwork[];
  categories: ArtworkCategory[];
}

export function DigitalArtGallery({
  artworks = [],
  categories = [],
}: DigitalArtGalleryProps) {
  const [selectedCatSlug, setSelectedCatSlug] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredArtworks =
    selectedCatSlug === "all"
      ? artworks
      : artworks.filter((a) => a.category?.slug === selectedCatSlug);

  const activeArtwork =
    lightboxIndex !== null ? filteredArtworks[lightboxIndex] : null;

  return (
    <div className="space-y-10">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-4">
        <button
          onClick={() => setSelectedCatSlug("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
            selectedCatSlug === "all"
              ? "bg-accent text-accent-foreground font-semibold shadow-sm"
              : "bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/60"
          )}
        >
          All Works ({artworks.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCatSlug(cat.slug)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              selectedCatSlug === cat.slug
                ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                : "bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/60"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Responsive Gallery Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="py-20 text-center text-xs text-muted-foreground">
          No artworks found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArtworks.map((art, index) => (
            <div
              key={art.id}
              data-editable-type="artwork"
              data-editable-id={art.id}
              data-editable-title={art.title}
              data-editable-slug={art.slug}
              data-edit-url={`/admin/digital-art/${art.id}`}
              data-add-url="/admin/digital-art/new"
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface/40 p-4 transition-all duration-300 hover:border-accent/50 hover:bg-surface/80 shadow-sm backdrop-blur-sm"
            >
              {/* Image Container with preserved ratio */}
              <div className="relative mb-4 h-72 w-full overflow-hidden rounded-xl bg-surface-secondary border border-border/50">
                <GalleryCardImage
                  src={art.thumbnailUrl || art.imageUrl}
                  fallbackSrc={art.imageUrl}
                  alt={art.title}
                />

                {/* Lightbox Quick Action Overlay */}
                <button
                  onClick={() => setLightboxIndex(index)}
                  className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/70 p-2 text-white/80 opacity-0 transition-all hover:bg-accent hover:text-accent-foreground group-hover:opacity-100 backdrop-blur-sm"
                  title="Expand Full Artwork"
                  aria-label={`Expand ${art.title}`}
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {/* Speedpaint Video Indicator Badge */}
                {art.videoUrl && (
                  <span className="absolute top-2.5 right-2.5 rounded-md bg-black/75 px-2 py-1 text-[10px] font-mono text-white/90 backdrop-blur-md flex items-center gap-1 shadow-md border border-white/10">
                    <Video className="h-3 w-3 text-accent" />
                    <span>Speedpaint</span>
                  </span>
                )}
              </div>

              {/* Artwork Metadata */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{art.category?.name || "Digital Art"}</span>
                  <span>{art.year}</span>
                </div>

                <h3 className="text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent">
                  <Link href={`/digital-art/${art.slug}`}>
                    {art.title}
                  </Link>
                </h3>

                {art.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {art.description}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-border/40 text-muted-foreground">
                  <span className="font-mono text-[10px]">{art.medium}</span>
                  <Link
                    href={`/digital-art/${art.slug}`}
                    className="text-accent hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>View Detail</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Viewer */}
      {activeArtwork && (
        <ArtworkLightbox
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          imageUrl={activeArtwork.imageUrl}
          title={activeArtwork.title}
          year={activeArtwork.year}
          medium={activeArtwork.medium}
          hasPrev={lightboxIndex !== null && lightboxIndex > 0}
          hasNext={lightboxIndex !== null && lightboxIndex < filteredArtworks.length - 1}
          onPrev={() => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev < filteredArtworks.length - 1 ? prev + 1 : prev
            )
          }
        />
      )}
    </div>
  );
}

export default DigitalArtGallery;
