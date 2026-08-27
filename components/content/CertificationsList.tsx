"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ZoomIn } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date | string;
  expirationDate?: Date | string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  imageUrl?: string | null;
}

export function CertificationsList({ certs }: { certs: Certification[] }) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const imageCerts = certs.filter((c) => Boolean(c.imageUrl));

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {certs.map((cert) => (
          <div
            key={cert.id}
            className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/30 p-6 backdrop-blur-sm transition-all hover:border-accent/50 hover:bg-surface/60 shadow-sm"
          >
            <div className="space-y-4">
              {cert.imageUrl && (
                <div
                  onClick={() => {
                    const idx = imageCerts.findIndex((c) => c.id === cert.id);
                    if (idx !== -1) setPreviewIndex(idx);
                  }}
                  className="group/img relative aspect-[16/11] w-full overflow-hidden rounded-xl border border-border/60 bg-surface-secondary/40 flex items-center justify-center p-1.5 cursor-pointer"
                  title="Click to view full-size certificate"
                >
                  <Image
                    src={cert.imageUrl}
                    alt={cert.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover/img:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Hover hint */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="rounded-full bg-black/70 p-2 text-white shadow-md flex items-center gap-1.5 text-xs font-medium px-3">
                      <ZoomIn className="h-3.5 w-3.5" />
                      <span>View Full Size</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-xs font-mono font-semibold uppercase text-accent">
                  {cert.issuer}
                </span>

                <h2 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors">
                  {cert.name}
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span>Issued {formatDate(cert.issueDate, { month: "short", year: "numeric" })}</span>
                  {cert.expirationDate && (
                    <>
                      <span>•</span>
                      <span>Expires {formatDate(cert.expirationDate, { month: "short", year: "numeric" })}</span>
                    </>
                  )}
                </div>

                {cert.credentialId && (
                  <p className="text-[11px] font-mono text-muted-foreground pt-1">
                    ID: {cert.credentialId}
                  </p>
                )}
              </div>
            </div>

            {cert.credentialUrl && (
              <div className="pt-5 border-t border-border/40 mt-4">
                <Button asChild size="sm" variant="outline" className="w-full gap-1.5 rounded-lg text-xs">
                  <a href={cert.credentialUrl} target="_blank" rel="noreferrer">
                    <span>Verify Credential</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full-screen Certificate Lightbox */}
      {previewIndex !== null && imageCerts[previewIndex] && (
        <ImageLightboxModal
          isOpen={previewIndex !== null}
          onClose={() => setPreviewIndex(null)}
          src={imageCerts[previewIndex].imageUrl || ""}
          title={imageCerts[previewIndex].name}
          subtitle={`${imageCerts[previewIndex].issuer} • Issued ${formatDate(imageCerts[previewIndex].issueDate, { month: "short", year: "numeric" })}`}
          hasPrev={previewIndex > 0}
          hasNext={previewIndex < imageCerts.length - 1}
          onPrev={() => setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
          onNext={() => setPreviewIndex((prev) => (prev !== null && prev < imageCerts.length - 1 ? prev + 1 : prev))}
        />
      )}
    </>
  );
}
