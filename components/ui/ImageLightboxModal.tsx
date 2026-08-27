"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Copy,
  Check,
  Maximize2,
  ExternalLink,
} from "lucide-react";

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  downloadUrl?: string;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  src,
  alt = "Preview image",
  title,
  subtitle,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  downloadUrl,
}: ImageLightboxProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCopy = () => {
    if (src) {
      navigator.clipboard.writeText(src);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev && hasPrev) onPrev();
      if (e.key === "ArrowRight" && onNext && hasNext) onNext();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-" || e.key === "_") handleZoomOut();
      if (e.key === "0") handleResetZoom();
    },
    [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setZoomLevel(1);
  }, [src]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
    >
      {/* Top Header Controls */}
      <div className="w-full z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex flex-col max-w-[60%] text-left">
          {title && <h3 className="text-sm font-semibold text-white truncate">{title}</h3>}
          {subtitle && <p className="text-xs text-white/60 font-mono truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Copy URL */}
          <button
            onClick={handleCopy}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            title="Copy Image URL"
          >
            {copied ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>

          {/* Download */}
          <a
            href={downloadUrl || src}
            download={title || "download"}
            target="_blank"
            rel="noreferrer"
            className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            title="Open / Download High-Res"
          >
            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
          </a>

          {/* Close */}
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors ml-2"
            title="Close (Esc)"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 w-full flex items-center justify-center p-4 overflow-auto cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="relative max-h-full max-w-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[82vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => {
              e.stopPropagation();
              if (zoomLevel === 1) handleZoomIn();
              else handleResetZoom();
            }}
          />
        </div>

        {/* Previous Button */}
        {hasPrev && onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white backdrop-blur-md hover:bg-black/90 hover:scale-110 transition-all"
            title="Previous Image (Left Arrow)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Next Button */}
        {hasNext && onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white backdrop-blur-md hover:bg-black/90 hover:scale-110 transition-all"
            title="Next Image (Right Arrow)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full py-3 px-6 text-center text-xs text-white/50 bg-gradient-to-t from-black/90 to-transparent">
        Click image to toggle zoom • Press Esc to exit
      </div>
    </div>
  );
}
