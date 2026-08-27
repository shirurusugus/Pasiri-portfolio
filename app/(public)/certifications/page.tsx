import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, ArrowUpRight, CheckCircle2, Calendar } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CertificationsList } from "@/components/content/CertificationsList";

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
      <CertificationsList certs={certs} />

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
