import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, ArrowUpRight, CheckCircle2, Calendar } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Certifications",
  description: "Verified professional certifications and specializations of pasiri.",
};

export const revalidate = 60;

export default async function CertificationsPage() {
  const certs = await prisma.certification.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-12 border-b border-border/60 pb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Certifications
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed max-w-2xl">
          Verified industry credentials in frontend engineering, cloud infrastructure, and human-centered design.
        </p>
      </div>

      {/* Certifications List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {certs.map((cert) => (
          <div
            key={cert.id}
            className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/30 p-6 backdrop-blur-sm transition-all hover:border-accent/50 hover:bg-surface/60"
          >
            <div className="space-y-4">
              {cert.imageUrl && (
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border border-border/60 bg-surface-secondary/40 flex items-center justify-center p-1.5">
                  <Image
                    src={cert.imageUrl}
                    alt={cert.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
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

      <div className="mt-16 border-t border-border/60 pt-8 flex items-center justify-between">
        <Link href="/skills" className="text-xs font-medium text-accent hover:underline">
          ← View Skills & Tooling
        </Link>
        <Link href="/resume" className="text-xs font-medium text-accent hover:underline">
          View Resume & PDF →
        </Link>
      </div>
    </div>
  );
}
