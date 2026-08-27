"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ArtworkLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  year?: number | null;
  medium?: string | null;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function ArtworkLightbox({
  isOpen,
  onClose,
  imageUrl,
  title,
  year,
  medium,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: ArtworkLightboxProps) {
  const [zoomed, setZoomed] = useState(false);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev && hasPrev) onPrev();
      if (e.key === "ArrowRight" && onNext && hasNext) onNext();
    },
    [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Reset zoom when image changes
    setZoomed(false);
  }, [imageUrl]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Artwork Viewer: ${title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
    >
      {/* Top Bar Controls */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-left text-white pr-4">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {(year || medium) && (
            <p className="text-xs text-white/60 font-mono">
              {[year, medium].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomed(!zoomed)}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title={zoomed ? "Zoom Out" : "Zoom In"}
            aria-label={zoomed ? "Zoom Out" : "Zoom In"}
          >
            {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Close Lightbox (Esc)"
            aria-label="Close Lightbox"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Prev / Next Chevrons */}
      {hasPrev && onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 z-40 rounded-full bg-black/50 p-3 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          title="Previous Artwork (Left Arrow)"
          aria-label="Previous Artwork"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 z-40 rounded-full bg-black/50 p-3 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          title="Next Artwork (Right Arrow)"
          aria-label="Next Artwork"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Main Image Container */}
      <div
        className={`relative flex items-center justify-center p-6 w-full h-full max-w-7xl max-h-screen overflow-auto cursor-zoom-${
          zoomed ? "out" : "in"
        }`}
        onClick={() => setZoomed(!zoomed)}
      >
        <div
          className={`relative transition-transform duration-300 ${
            zoomed ? "scale-125 md:scale-150 cursor-grab" : "scale-100"
          }`}
          style={{ width: "90vw", height: "80vh" }}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
      </div>
    </div>
  );
}

export default ArtworkLightbox;
